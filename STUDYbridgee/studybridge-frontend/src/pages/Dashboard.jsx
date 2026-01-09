import React, { useState, useEffect, useMemo } from "react";
import SearchForm from "../SearchForm";

function Dashboard() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);
  const [topicDefinitions, setTopicDefinitions] = useState({});
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // --- PROGRESS TRACKING STATE ---
  const [seconds, setSeconds] = useState(0);
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("studyBridgeStats");
    return saved
      ? JSON.parse(saved)
      : {
          masteredIds: [],
          searchCount: 0,
          dailyLog: {},
          totalMins: 0,
        };
  });

  // 1. SYNC TO LOCAL STORAGE
  // Updated: Only saves if the initial database sync is finished
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem("studyBridgeStats", JSON.stringify(stats));
    }
  }, [stats, isInitialLoad]);

  // 2. SESSION TIMER
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. MINUTE COUNTER
  useEffect(() => {
    if (seconds > 0 && seconds % 60 === 0) {
      setStats((prev) => ({ ...prev, totalMins: (prev.totalMins || 0) + 1 }));
    }
  }, [seconds]);

  // 4. DATABASE SYNC (The "Bridge" to her Backend)
  useEffect(() => {
    const loadProgress = async () => {
      const token = localStorage.getItem("token"); // Token from her login logic
      if (token) {
        try {
          const res = await fetch("http://localhost:5000/api/progress", {
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.masteredIds) {
              // We update our local stats with the "truth" from her MongoDB
              setStats((prev) => ({ ...prev, masteredIds: data.masteredIds }));
            }
          } else if (res.status === 401) {
            // Token is bad!
            localStorage.removeItem("token");
            window.location.href = "/account";
          }
        } catch (err) {
          console.log("Using local cache only - Backend connection failed");
        }
      }
      // Once we try to fetch, we allow local storage saving to start
      setIsInitialLoad(false);
    };

    loadProgress();
  }, []);

  const toggleMastery = async (id) => {
    // Use 'en-CA' for a reliable YYYY-MM-DD local date string
    const today = new Date().toLocaleDateString("en-CA");
    const token = localStorage.getItem("token");

    const isNowMastered = !stats.masteredIds.includes(id);

    setStats((prev) => {
      const newIds = isNowMastered
        ? [...prev.masteredIds, id]
        : prev.masteredIds.filter((i) => i !== id);

      // FIX: Ensure the log marks the day as active (1)
      const newLog = {
        ...prev.dailyLog,
        [today]: isNowMastered
          ? 1
          : prev.masteredIds.filter((i) => i !== id).length > 0
          ? 1
          : 0,
      };

      return { ...prev, masteredIds: newIds, dailyLog: newLog };
    });

    if (token) {
      try {
        await fetch("http://localhost:5000/api/progress/toggle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ cardId: id }),
        });
      } catch (err) {
        console.error("Database sync failed", err);
      }
    }
  };
  const analytics = useMemo(() => {
    const days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);

        // Use 'en-CA' to match the toggleMastery format exactly
        const iso = d.toLocaleDateString("en-CA");
        const dayName = d.toLocaleDateString("en-US", { weekday: "narrow" });

        // Check if this day has activity in the dailyLog
        const isActive = !!(stats.dailyLog && stats.dailyLog[iso]);

        return {
          dayName,
          isActive,
          dateNum: iso.split("-")[2],
        };
      })
      .reverse();

    return {
      session: `${Math.floor(seconds / 60)}m ${seconds % 60}s`,
      days,
    };
  }, [stats.dailyLog, seconds]); // Only re-run when log or time changes
  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };
  const markTodayActive = () => {
    const today = new Date().toISOString().split("T")[0];

    setStats((prev) => ({
      ...prev,
      dailyLog: {
        ...prev.dailyLog,
        [today]: (prev.dailyLog[today] || 0) + 1,
      },
    }));
  };

  const handleSearch = async (query) => {
    markTodayActive();
    setLoading(true);
    setCurrentQuery(query);
    setExpandedCard(null);
    setTopicDefinitions({});

    setStats((prev) => ({ ...prev, searchCount: prev.searchCount + 1 }));

    try {
      const res = await fetch(`http://localhost:5000/api/search?q=${query}`);
      const data = await res.json();

      if (data.results) {
        let filteredData = data.results;

        // MODIFIED: Fix for Math/Mathematics filtering
        if (selectedSubjects.length > 0) {
          filteredData = data.results.filter((item) => {
            const isMathMatch =
              selectedSubjects.includes("Math") &&
              item.subject === "Mathematics";
            return selectedSubjects.includes(item.subject) || isMathMatch;
          });
        }

        filteredData.sort((a, b) => {
          const searchLower = query.toLowerCase();
          const aDirect =
            a.subject.toLowerCase().includes(searchLower) ||
            a.unit.toLowerCase().includes(searchLower);
          const bDirect =
            b.subject.toLowerCase().includes(searchLower) ||
            b.unit.toLowerCase().includes(searchLower);
          if (aDirect && !bDirect) return -1;
          if (!aDirect && bDirect) return 1;
          return 0;
        });

        const defs = {};
        const allMatchedTopics = filteredData.flatMap((item) =>
          item.matchedTopics.map((t) => ({
            name: t,
            subject: item.subject,
            grade: item.grade,
            unit: item.unit,
          }))
        );

        await Promise.all(
          allMatchedTopics.map(async (topicObj) => {
            let cleanLine = topicObj.name
              .replace(/^[0-9.]+\s*/, "")
              .replace(/^[Uu]nit\s*\d+[:\s]*/, "")
              .replace(/\b(I|II|III|IV|V|VI)\b/g, "")
              .trim();

            let subTopics = cleanLine
              .split(/[&|,:]+/)
              .map((s) => s.trim())
              .filter((s) => s.length > 2);
            let combinedDefinitions = [];

            for (let sub of subTopics) {
              let searchTerm = sub
                .replace(/\?|How|do|plants|harness|what|is|the/gi, "")
                .trim();
              let searchVariations = [
                searchTerm,
                `${searchTerm} (${topicObj.subject.toLowerCase()})`,
                topicObj.unit
                  .replace(/^[Uu]nit\s*\d+[:\s]*/, "")
                  .replace(/\b(I|II|III|IV|V|VI)\b/g, "")
                  .trim(),
              ];

              let found = false;
              for (let variant of searchVariations) {
                if (found) break;
                try {
                  let wikiRes = await fetch(
                    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
                      variant
                    )}?redirect=true&origin=*`
                  );
                  let wikiJson = await wikiRes.json();
                  if (wikiJson.extract && wikiJson.type !== "disambiguation") {
                    let shortDef =
                      wikiJson.extract.split(". ").slice(0, 1).join(". ") + ".";
                    combinedDefinitions.push(
                      `<strong>${searchTerm.toUpperCase()}:</strong> ${shortDef}`
                    );
                    found = true;
                  }
                } catch (e) {
                  continue;
                }
              }
            }

            const subjectFocus = {
              Biology: "biological structures and life processes",
              Chemistry: "chemical reactions and molecular properties",
              Physics: "physical laws and energy interactions",
              Math: "mathematical logic and quantitative patterns",
              Mathematics: "mathematical logic and quantitative patterns",
            };

            const fallback = `In ${
              topicObj.subject
            }, <strong>${cleanLine}</strong> is a core concept focusing on the ${
              subjectFocus[topicObj.subject] || "fundamental principles"
            } essential for Grade ${
              topicObj.grade
            } students to understand the mechanisms of ${topicObj.unit}.`;

            defs[`${topicObj.subject}-${topicObj.name}`] =
              combinedDefinitions.length > 0
                ? combinedDefinitions.join("<br/><br/>")
                : fallback;
          })
        );

        setTopicDefinitions(defs);
        data.results = filteredData;
      }

      let globalWikiData = {};
      try {
        let globalWikiRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            query
          )}?redirect=true&origin=*`
        );
        globalWikiData = await globalWikiRes.json();
      } catch (wikiErr) {
        console.error(wikiErr);
      }

      setResults({
        ...data,
        wikiExtract: globalWikiData.extract || "No global definition found.",
        wikiImg: globalWikiData.thumbnail?.source || null,
      });
    } catch (err) {
      console.error(err);
      alert("Error fetching data!");
    }
    setLoading(false);
  };

  const getUniqueSubjectContexts = () => {
    if (!results || !results.results) return [];
    const subjects = {};
    results.results.forEach((item) => {
      if (!subjects[item.subject]) {
        const firstFullTopic = item.matchedTopics[0] || "";
        const topicBeforeColon = firstFullTopic.split(":")[0];
        const cleanTopic = topicBeforeColon
          .replace(/^[0-9.]+\s*/, "")
          .replace(/\b[Tt]he\b\s+/g, "")
          .trim();

        subjects[item.subject] = {
          subject: item.subject,
          topicLink: cleanTopic || item.unit,
        };
      }
    });
    return Object.values(subjects);
  };

  const getGeneralBook = (subject) => {
    const books = {
      Biology: "Campbell Biology",
      Physics: "University Physics",
      Chemistry: "Chemistry: The Central Science",
      Math: "Thomas' Calculus",
      Mathematics: "Thomas' Calculus",
    };
    return books[subject] || "Oxford Science Reference Guide";
  };

  const toggleExpand = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* PROGRESS OVERLAY - FIXED POSITION */}
      {/* CALENDAR PROGRESS OVERLAY */}

      <div style={progressCardStyle}>
        <div style={progressHeaderStyle}>
          <div style={pulseDotStyle}></div>
          <span style={sessionTimerStyle}>{analytics.session}</span>
        </div>

        <div style={statGridStyle}>
          <div style={statBoxStyle}>
            <div style={statNumberStyle}>{stats.masteredIds.length}</div>
            <div style={statLabelStyle}>Topics Mastered</div>
          </div>
        </div>

        {/* Weekly Calendar Row */}
        <div style={calendarRowStyle}>
          {analytics.days.map((d, i) => (
            <div key={i} style={dayCircleWrapperStyle}>
              <div
                style={{
                  ...dayCircleStyle,
                  backgroundColor: d.isActive ? "#27ae60" : "#f8f9fa",
                  color: d.isActive ? "#fff" : "#bdc3c7",
                  border: d.isActive ? "none" : "1px solid #edeff2",
                }}
              >
                {d.isActive ? "✓" : ""}
              </div>
              <div style={barDateStyle}>{d.dayName}</div>
            </div>
          ))}
        </div>

        <div style={totalTimeStyle}>Focus Time: {stats.totalMins}m</div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "http://localhost:5000/account.html";
          }}
          style={logoutButtonStyle}
        >
          🚪 Sign Out
        </button>
      </div>
      <div style={appContainerStyle}>
        <header style={headerStyle}>
          <div style={headerFlexStyle}>
            <h1 style={titleStyle}>🌐 StudyBridge</h1>
            <button
              onClick={() => setShowFilter(!showFilter)}
              style={filterToggleButtonStyle}
            >
              {selectedSubjects.length > 0
                ? `🎯 Filtered (${selectedSubjects.length})`
                : "⚙️ Filter Subject"}
            </button>
          </div>
          <p style={subtitleStyle}>Curriculum Intelligence for Grades 9-12</p>

          {showFilter && (
            <div style={filterOverlayStyle}>
              <p style={footerSmallTitleStyle}>SELECT SUBJECTS TO INCLUDE:</p>
              <div style={filterGridStyle}>
                {["Biology", "Chemistry", "Physics", "Math"].map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSubject(s)}
                    style={
                      selectedSubjects.includes(s)
                        ? activeFilterItemStyle
                        : filterItemStyle
                    }
                  >
                    {selectedSubjects.includes(s) ? `✅ ${s}` : s}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFilter(false)}
                style={doneButtonStyle}
              >
                Done
              </button>
            </div>
          )}
        </header>
        <div style={tabContainerStyle}>
          <button style={activeTabButtonStyle}>🔍 Concept Bridge</button>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "calc(100vh - 140px)",
          }}
        >
          <SearchForm onSearch={handleSearch} externalTopic={currentQuery} />
          {loading && (
            <div style={loadingStyle}>✨ Extracting Subject Meanings...</div>
          )}
          {results && (
            <div style={resultsViewWrapperStyle}>
              <div style={aiSectionStyle}>
                <h2 style={insightTitleStyle}>
                  🧠 Concept Insight: {results.query}
                </h2>
                <div style={wikiBoxStyle}>
                  {results.wikiImg && (
                    <div style={wikiImageFrameStyle}>
                      <img
                        src={results.wikiImg}
                        alt={results.query}
                        style={wikiImageElementStyle}
                      />
                    </div>
                  )}
                  <div style={wikiContentWrapperStyle}>
                    <strong style={globalDefinitionLabelStyle}>
                      Global Definition:{" "}
                    </strong>
                    <span style={wikiExtractTextStyle}>
                      {results.wikiExtract}
                    </span>
                  </div>
                </div>

                <div style={resourceDividerStyle}>
                  <strong style={perspectiveHeadingStyle}>
                    📺 Perspectives & Learning Resources:
                  </strong>
                  <div style={perspectiveGridStyle}>
                    {getUniqueSubjectContexts().map((ctx, index) => (
                      <div key={index} style={resourceCardStyle}>
                        <span style={subjectTagStyle}>
                          {ctx.subject.toUpperCase()} PERSPECTIVE
                        </span>
                        <div style={buttonFlexStyle}>
                          <a
                            href={`https://www.youtube.com/results?search_query=${ctx.subject}+${ctx.topicLink}`}
                            target="_blank"
                            rel="noreferrer"
                            style={videoButtonStyle}
                          >
                            ▶️ {ctx.subject} Video
                          </a>
                          <a
                            href={`https://en.wikipedia.org/wiki/${ctx.topicLink.replace(
                              /\s+/g,
                              "_"
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            style={wikiLinkButtonStyle}
                          >
                            📝 Wiki
                          </a>
                          <a
                            href={`https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(
                              ctx.topicLink
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            style={khanButtonStyle}
                          >
                            🎓 Khan Academy
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <h2 style={sectionTitleStyle}>
                📚 Textbook Connections ({results.results?.length || 0})
              </h2>
              <div style={resultsGridStyle}>
                {results.results?.map((item, i) => {
                  const cardId = `${item.subject}-${item.unit}-${item.grade}`;
                  const isMastered = stats.masteredIds.includes(cardId);
                  return (
                    <div
                      key={cardId} // Use cardId for the key
                      style={{
                        ...curriculumCardStyle,
                        // This makes the card border change immediately
                        borderTop: isMastered
                          ? "6px solid #27ae60"
                          : "1px solid #f0f0f0",
                        boxShadow: isMastered
                          ? "0 4px 15px rgba(39, 174, 96, 0.1)"
                          : "none",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div style={cardHeaderFlexStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                          }}
                        >
                          <span style={subjectBadgeStyle}>{item.subject}</span>
                          <span style={gradeBadgeStyle}>{item.grade}</span>
                        </div>
                        <button
                          onClick={() => toggleMastery(cardId)}
                          style={
                            isMastered
                              ? masteredButtonStyle
                              : unmasteredButtonStyle
                          }
                        >
                          {isMastered ? "✅ Mastered" : "📚 Mark Studied"}
                        </button>
                      </div>
                      <div style={unitTitleFlexStyle}>
                        <h3 style={unitHeadingStyle}>{item.unit}</h3>
                        <button
                          onClick={() => toggleExpand(i)}
                          style={expandButtonStyle}
                        >
                          {expandedCard === i ? "▴" : "▾"}
                        </button>
                      </div>

                      {expandedCard === i && (
                        <div style={collapsibleContentStyle}>
                          <p style={perspectiveLabelStyle}>
                            {item.subject} Perspective:
                          </p>
                          {item.matchedTopics?.map((topic, idx) => (
                            <div key={idx} style={topicDefinitionBoxStyle}>
                              <p
                                dangerouslySetInnerHTML={{
                                  __html:
                                    topicDefinitions[
                                      `${item.subject}-${topic}`
                                    ] || "Fetching scientific explanation...",
                                }}
                                style={topicDefinitionTextStyle}
                              />
                            </div>
                          ))}
                          <p style={collapsibleFooterTextStyle}>
                            Essential for Grade {item.grade} to master{" "}
                            {item.unit}.
                          </p>
                        </div>
                      )}

                      <div style={topicsLabelAreaStyle}>
                        <strong style={matchedTopicBoldStyle}>
                          Matched Topics:
                        </strong>
                        <div style={tagCloudWrapperStyle}>
                          {item.matchedTopics?.map((topicStr, outerIdx) => (
                            <span
                              key={outerIdx}
                              style={{ marginRight: "10px" }}
                            >
                              {topicStr
                                .split(/([,:]\s*)/)
                                .map((part, innerIdx) => {
                                  const isSeparator = /[,:]/.test(part);
                                  if (isSeparator) {
                                    return (
                                      <span
                                        key={innerIdx}
                                        style={commaSeparatorStyle}
                                      >
                                        {part}
                                      </span>
                                    );
                                  }

                                  const numberMatch = part.match(/^[0-9.]+\s*/);
                                  const numberPrefix = numberMatch
                                    ? numberMatch[0]
                                    : "";
                                  let remainingText = part.replace(
                                    /^[0-9.]+\s*/,
                                    ""
                                  );

                                  const theMatch =
                                    remainingText.match(/^([Tt]he\s+)/);
                                  const thePrefix = theMatch ? theMatch[0] : "";
                                  const cleanWord = remainingText
                                    .replace(/^([Tt]he\s+)/, "")
                                    .trim();

                                  if (!cleanWord && !numberPrefix && !thePrefix)
                                    return part;

                                  return (
                                    <React.Fragment key={innerIdx}>
                                      {numberPrefix && (
                                        <span style={curriculumNumberStyle}>
                                          {numberPrefix}
                                        </span>
                                      )}
                                      {thePrefix && (
                                        <span style={curriculumNumberStyle}>
                                          {thePrefix}
                                        </span>
                                      )}
                                      {cleanWord && (
                                        <a
                                          href={`https://en.wikipedia.org/wiki/${cleanWord.replace(
                                            /\s+/g,
                                            "_"
                                          )}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={topicLinkTagStyle}
                                        >
                                          {cleanWord}
                                        </a>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={cardFooterAreaStyle}>
                        <p style={footerSmallTitleStyle}>RECOMMENDED BOOKS:</p>
                        <div style={footerButtonStackStyle}>
                          <a
                            href="https://kehulum.com/"
                            target="_blank"
                            rel="noreferrer"
                            style={ethioBookButtonStyle}
                          >
                            📖 Ethiopian Curriculum Books
                          </a>
                          <a
                            href={`https://www.google.com/search?q=${getGeneralBook(
                              item.subject
                            )}+PDF`}
                            target="_blank"
                            rel="noreferrer"
                            style={globalBookButtonStyle}
                          >
                            📘 {getGeneralBook(item.subject)}
                          </a>
                        </div>

                        <p style={footerRelatedTitleStyle}>RELATED CONCEPTS:</p>
                        <div style={tagCloudWrapperStyle}>
                          {(item.relatedConcepts &&
                          item.relatedConcepts.length > 0
                            ? item.relatedConcepts
                            : item.matchedTopics || []
                          )
                            .flatMap((rawString) => rawString.split(/[;:,]+/))
                            .map((s) => s.replace(/^[0-9.]+\s*/, "").trim())
                            .filter((s) => s.length > 2)
                            .slice(0, 10)
                            .map((concept, idx) => (
                              <a
                                key={idx}
                                href={`https://en.wikipedia.org/wiki/${concept.replace(
                                  /\s+/g,
                                  "_"
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                style={tagItemStyle}
                              >
                                {concept}
                              </a>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const progressCardStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  width: "220px",
  backgroundColor: "#fff",
  borderRadius: "16px",
  padding: "18px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  border: "1px solid #f1f2f6",
  zIndex: 9999,
};

const progressHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  marginBottom: "12px",
};

const pulseDotStyle = {
  width: "8px",
  height: "8px",
  backgroundColor: "#e74c3c",
  borderRadius: "50%",
};

const sessionTimerStyle = {
  fontSize: "13px",
  fontWeight: "bold",
  color: "#2f3542",
  fontFamily: "monospace",
};

const statGridStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "16px",
  textAlign: "center",
};

const statBoxStyle = {
  flex: 1,
};

const statNumberStyle = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#27ae60",
};

const statLabelStyle = {
  fontSize: "10px",
  color: "#a4b0be",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const chartContainerStyle = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  height: "50px",
  padding: "0 4px",
  borderBottom: "1px solid #f1f2f6",
  paddingBottom: "4px",
};

const barWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4px",
};

const barStyle = {
  width: "12px",
  borderRadius: "3px",
  transition: "height 0.3s ease",
};

const barDateStyle = {
  fontSize: "9px",
  color: "#2c3e50",
  fontWeight: "600",
};
const calendarRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderTop: "1px solid #f1f2f6",
  borderBottom: "1px solid #f1f2f6",
  margin: "10px 0",
};
const dayCircleWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
};

const dayCircleStyle = {
  width: "22px",
  height: "22px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: "bold",
  backgroundColor: "#eef1f5", // 👈 darker
  border: "1px solid #ced6e0", // 👈 visible
};

const logoutButtonStyle = {
  width: "100%",
  marginTop: "15px",
  padding: "8px",
  backgroundColor: "transparent",
  color: "#e74c3c",
  border: "1px solid #ffcccc",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
  transition: "0.2s",
};
// Add hover effect for logout if you like via standard CSS or JS mouseOver
const totalTimeStyle = {
  fontSize: "10px",
  textAlign: "center",
  marginTop: "8px",
  color: "#747d8c",
  fontWeight: "600",
};

const masteredButtonStyle = {
  padding: "5px 12px",
  borderRadius: "15px",
  border: "none",
  backgroundColor: "#27ae60",
  color: "#fff",
  fontSize: "11px",
  fontWeight: "bold",
  cursor: "pointer",
};

const unmasteredButtonStyle = {
  padding: "5px 12px",
  borderRadius: "15px",
  border: "1px solid #bdc3c7",
  backgroundColor: "#fff",
  color: "#7f8c8d",
  fontSize: "11px",
  fontWeight: "bold",
  cursor: "pointer",
};

const appContainerStyle = {
  flex: "1",
  maxWidth: "900px", // Limits width so it doesn't stretch too far
  padding: "120px 20px 40px 20px", // Equal padding on all sides
  fontFamily: "'Segoe UI', Roboto, sans-serif",
  backgroundColor: "#f9f9f9",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "30px",
  position: "relative",
};

const headerFlexStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
};

const filterToggleButtonStyle = {
  padding: "8px 15px",
  borderRadius: "20px",
  border: "1px solid #3498db",
  backgroundColor: "#fff",
  color: "#3498db",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "13px",
};

const filterOverlayStyle = {
  position: "absolute",
  top: "70px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  zIndex: "1000",
  width: "280px",
  border: "1px solid #eee",
};

const filterGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
  margin: "15px 0",
};

const filterItemStyle = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #eee",
  backgroundColor: "#f9f9f9",
  fontSize: "12px",
  cursor: "pointer",
};

const activeFilterItemStyle = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #3498db",
  backgroundColor: "#eaf2f8",
  color: "#3498db",
  fontWeight: "bold",
  fontSize: "12px",
  cursor: "pointer",
};

const doneButtonStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#3498db",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
};

const titleStyle = {
  color: "#2c3e50",
  fontSize: "2.8rem",
  marginBottom: "10px",
};

const subtitleStyle = {
  color: "#7f8c8d",
};

const tabContainerStyle = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "30px",
  gap: "15px",
};

const activeTabButtonStyle = {
  padding: "12px 25px",
  cursor: "default",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#3498db",
  color: "white",
  fontWeight: "bold",
};

const loadingStyle = {
  textAlign: "center",
  padding: "20px",
};

const resultsViewWrapperStyle = {
  marginTop: "30px",
  minHeight: "400px", // ensure it has space even if few results
};

const aiSectionStyle = {
  backgroundColor: "#fff",
  padding: "25px",
  borderRadius: "12px",
  marginBottom: "40px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  borderLeft: "6px solid #3498db",
};

const insightTitleStyle = {
  marginTop: "0px",
  color: "#2980b9",
  fontSize: "1.4rem",
};

const wikiBoxStyle = {
  display: "flex",
  gap: "20px",
  marginBottom: "20px",
  padding: "15px",
  backgroundColor: "#fcfcfc",
  borderRadius: "8px",
  border: "1px solid #eee",
  alignItems: "flex-start",
};

const wikiImageFrameStyle = {
  flexShrink: "0",
};

const wikiImageElementStyle = {
  width: "130px",
  height: "130px",
  objectFit: "cover",
  borderRadius: "6px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

const wikiContentWrapperStyle = {
  flex: "1",
};

const globalDefinitionLabelStyle = {
  color: "#2c3e50",
  fontSize: "15px",
};

const wikiExtractTextStyle = {
  fontSize: "14.5px",
  lineHeight: "1.6",
  color: "#444",
};

const resourceDividerStyle = {
  marginTop: "25px",
  borderTop: "1px solid #eee",
  paddingTop: "20px",
};

const perspectiveHeadingStyle = {
  display: "block",
  marginBottom: "15px",
  color: "#2c3e50",
};

const perspectiveGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "15px",
};

const resourceCardStyle = {
  backgroundColor: "#fcfcfc",
  padding: "15px",
  borderRadius: "8px",
  border: "1px solid #f0f0f0",
};

const subjectTagStyle = {
  fontSize: "10px",
  fontWeight: "bold",
  color: "#3498db",
  letterSpacing: "1px",
};

const buttonFlexStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginTop: "10px",
};

const videoButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#fef2f2",
  borderRadius: "6px",
  textDecoration: "none",
  color: "#c0392b",
  fontSize: "12px",
  fontWeight: "600",
  border: "1px solid #fadbd8",
};

const wikiLinkButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#eef2ff",
  borderRadius: "6px",
  textDecoration: "none",
  color: "#3730a3",
  fontSize: "12px",
  fontWeight: "600",
  border: "1px solid #c7d2fe",
};

const khanButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#f0fff4",
  borderRadius: "6px",
  textDecoration: "none",
  color: "#166534",
  fontSize: "12px",
  fontWeight: "600",
  border: "1px solid #bbf7d0",
};

const sectionTitleStyle = {
  fontSize: "1.2rem",
  color: "#2c3e50",
  marginBottom: "20px",
};

const resultsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
};

const curriculumCardStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  border: "1px solid #f0f0f0",
};

const cardHeaderFlexStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const unitTitleFlexStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "10px",
};

const expandButtonStyle = {
  background: "none",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
  color: "#3498db",
};

const collapsibleContentStyle = {
  backgroundColor: "#f1f7fd",
  padding: "15px",
  borderRadius: "8px",
  margin: "10px 0px",
  borderLeft: "5px solid #3498db",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
};

const perspectiveLabelStyle = {
  fontWeight: "bold",
  color: "#2980b9",
  marginBottom: "10px",
  fontSize: "14px",
};

const topicDefinitionBoxStyle = {
  marginBottom: "12px",
  paddingLeft: "5px",
};

const topicDefinitionTextStyle = {
  fontSize: "13.5px",
  color: "#444",
  lineHeight: "1.6",
};

const collapsibleFooterTextStyle = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#2c3e50",
  marginTop: "15px",
  borderTop: "1px solid #dcecf9",
  paddingTop: "10px",
};

const subjectBadgeStyle = {
  fontWeight: "bold",
  color: "#3498db",
  fontSize: "13px",
  textTransform: "uppercase",
};

const gradeBadgeStyle = {
  background: "#ecf0f1",
  padding: "3px 10px",
  borderRadius: "12px",
  fontSize: "11px",
};

const unitHeadingStyle = {
  margin: "0px",
  fontSize: "1.1rem",
  color: "#2c3e50",
};

const topicsLabelAreaStyle = {
  marginTop: "12px",
};

const matchedTopicBoldStyle = {
  color: "#34495e",
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
};

const tagCloudWrapperStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "2px",
};

const curriculumNumberStyle = {
  fontSize: "13px",
  color: "#2c3e50",
  fontWeight: "normal",
};

const commaSeparatorStyle = {
  fontSize: "13px",
  color: "#2c3e50",
  paddingRight: "4px",
};

const topicLinkTagStyle = {
  background: "none",
  border: "none",
  padding: "2px",
  fontSize: "13px",
  textDecoration: "underline",
  color: "#27ae60",
  fontWeight: "500",
  cursor: "pointer",
};

const cardFooterAreaStyle = {
  marginTop: "15px",
  borderTop: "1px solid #eee",
  paddingTop: "15px",
};

const footerSmallTitleStyle = {
  fontSize: "11px",
  fontWeight: "bold",
  color: "#95a5a6",
  marginBottom: "10px",
};

const footerRelatedTitleStyle = {
  fontSize: "11px",
  fontWeight: "bold",
  color: "#95a5a6",
  marginBottom: "10px",
  marginTop: "10px",
};

const footerButtonStackStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginBottom: "15px",
};

const ethioBookButtonStyle = {
  display: "block",
  padding: "8px 12px",
  backgroundColor: "#f0f9ff",
  border: "1px solid #3498db",
  borderRadius: "6px",
  color: "#2980b9",
  textDecoration: "none",
  fontSize: "12px",
  fontWeight: "bold",
  textAlign: "center",
};

const globalBookButtonStyle = {
  display: "block",
  padding: "8px 12px",
  backgroundColor: "#f0fdf4",
  border: "1px solid #22c55e",
  borderRadius: "6px",
  color: "#15803d",
  textDecoration: "none",
  fontSize: "12px",
  fontWeight: "bold",
  textAlign: "center",
};

const tagItemStyle = {
  background: "#f8f9fa",
  border: "1px solid #e9ecef",
  padding: "4px 10px",
  borderRadius: "4px",
  fontSize: "11px",
  textDecoration: "none",
  color: "#34495e",
};

export default Dashboard;

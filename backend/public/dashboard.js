const topics = [
    { name: "Energy", subject: "Physics" },
    { name: "Motion", subject: "Physics" },
    { name: "Photosynthesis", subject: "Biology" },
    { name: "Cell Respiration", subject: "Biology" },
    { name: "Acids and Bases", subject: "Chemistry" },
    { name: "Quadratic Equations", subject: "Maths" }
];

const topicList = document.getElementById("topicList");

function displayTopics(list) {
    topicList.innerHTML = "";
    list.forEach(topic => {
        const card = document.createElement("div");
        card.className = "topic-card";
        card.innerHTML = `
            <h4>${topic.name}</h4>
            <span>${topic.subject}</span>
        `;
        topicList.appendChild(card);
    });
}

function searchTopic() {
    const value = document.getElementById("searchInput").value.toLowerCase();
    const result = topics.filter(t => t.name.toLowerCase().includes(value));
    displayTopics(result);
}

function filterSubject(subject) {
    const result = topics.filter(t => t.subject === subject);
    displayTopics(result);
}

displayTopics(topics);
s
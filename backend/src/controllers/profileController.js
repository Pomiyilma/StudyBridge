// controllers/profileController.js
const bcrypt = require('bcryptjs');

module.exports = (User) => {
    return {
        /**
         * Get the logged-in user's profile
         * Excludes password
         */
        getUserProfile: async (req, res) => {
            try {
                // auth middleware sets req.user = decoded token (which has .id)
                const userId = req.user.id;
                const user = await User.findById(userId).select('-password -passwordHash');

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                res.json(user);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                res.status(500).json({ message: 'Server error' });
            }
        },

        /**
         * Update the logged-in user's profile
         * Only allows updating name, email, grade, avatar, bio, and password
         */
        updateUserProfile: async (req, res) => {
            try {
                const userId = req.user.id;
                const { name, email, grade, avatar, bio, password } = req.body;

                const user = await User.findById(userId);

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                // Update only allowed fields
                if (name) user.name = name;
                if (email) user.email = email;
                if (grade) user.grade = grade;
                if (avatar) user.avatar = avatar;
                if (bio) user.bio = bio;

                // Handle password update
                if (password) {
                    // Note: User model might use 'password' or 'passwordHash' field. 
                    // Looking at User.js: password: { type: String, required: true }
                    // Looking at auth.js: user.password = await bcrypt.hash(...)
                    user.password = await bcrypt.hash(password, 10);
                }

                await user.save();

                // Return updated user without password
                // We fetch again or convert to object and delete password
                const updatedUser = user.toObject();
                delete updatedUser.password;
                delete updatedUser.passwordHash; // just in case

                res.json(updatedUser);
            } catch (error) {
                console.error('Error updating profile:', error);
                res.status(500).json({ message: 'Server error' });
            }
        }
    };
};

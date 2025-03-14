const login = async (req, res) => {
    try {
        // Handle login logic here
        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

const register = async (req, res) => {
    try {
        // Handle registration logic here
        res.status(201).json({ message: "Registration successful" });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

module.exports = { login, register };


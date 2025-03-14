const createCase = async (req, res) => {
    try {
        // Handle case creation logic here
        res.status(201).json({ message: "Case created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Case creation failed", error: error.message });
    }
};

module.exports = { createCase };


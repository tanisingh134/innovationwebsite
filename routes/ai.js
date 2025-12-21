const express = require('express');
const router = express.Router();
require('dotenv').config();

// Safe initialization of Gemini
let model = null;
try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    if (process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-1.5-flash (faster) or gemini-1.5-pro (better quality)
        // gemini-pro is deprecated, use gemini-1.5-flash as default
        const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Gemini AI initialized with model: ${modelName}`);
    } else {
        console.log("GEMINI_API_KEY not found. Using Mock Fallback.");
    }
} catch (error) {
    console.warn("Gemini AI library missing or initialization failed. Using Mock Fallback.", error.message);
}

// Robust Mock Generator
const generateSmartMock = (type, data) => {
    try {
        const keywords = JSON.stringify(data || {}).toLowerCase();

        if (type === 'validate') {
            const score = Math.floor(Math.random() * (95 - 75) + 75);
            let strengths = ["Clear target audience", "Solves a real problem"];

            if (keywords.includes("environment") || keywords.includes("eco")) strengths.push("Sustainability focus is a strong trend");
            if (keywords.includes("ai") || keywords.includes("smart")) strengths.push("Leverages emerging tech");
            if (keywords.includes("social") || keywords.includes("connect")) strengths.push("Strong community potential");

            return {
                viabilityScore: score,
                analysis: {
                    strengths: strengths,
                    weaknesses: [
                        "Market competition needs analysis",
                        "Customer acquisition strategy needed"
                    ],
                    suggestions: [
                        "Start with an MVP focusing on core features",
                        "Validate with potential users early"
                    ],
                    marketPotential: "Moderate to High"
                }
            };
        }

        if (type === 'roadmap') {
            const description = JSON.stringify(data).toLowerCase();
            let p1Name = "Concept & MVP";
            let p1Steps = ["Market Research", "Core Features Dev", "Alpha Testing"];
            let p2Name = "Launch";
            let p2Steps = ["Beta Release", "Feedback Loop", "Marketing Setup"];

            // Customize based on keywords
            if (description.includes("ai") || description.includes("model")) {
                p1Name = "Data & Model Training";
                p1Steps = ["Data Collection", "Model Selection & Training", "Baseline Evaluation"];
                p2Name = "Integration & API";
                p2Steps = ["Model Wrapping", "API Development", "Latency Optimization"];
            } else if (description.includes("mobile") || description.includes("app")) {
                p1Name = "Prototype & Design";
                p1Steps = ["Wireframing", "UI/UX Design", "Frontend Development"];
                p2Name = "Backend & Launch";
                p2Steps = ["API Integration", "App Store Submission", "User Onboarding Flow"];
            }

            return {
                title: `Roadmap for ${data.title || 'Project'}`,
                phases: [
                    {
                        name: `Phase 1: ${p1Name}`,
                        duration: "4 Weeks",
                        steps: p1Steps
                    },
                    {
                        name: `Phase 2: ${p2Name}`,
                        duration: "4 Weeks",
                        steps: p2Steps
                    },
                    {
                        name: "Phase 3: Scale & Growth",
                        duration: "Ongoing",
                        steps: ["Feature Expansion", "User Scaling", "Monetization"]
                    }
                ]
            };
        }

        if (type === 'leanCanvas') {
            const conversationText = Array.isArray(data.conversation) ? data.conversation.join(' ') : (data.conversation || '');
            const text = conversationText.toLowerCase();

            // Extract information from conversation
            let problem = "Identify the top 3 problems your customers face";
            let solution = "Describe your unique solution approach";
            let keyMetrics = "What metrics will you track? (e.g., user growth, revenue)";
            let uniqueValue = "What makes your solution unique?";
            let unfairAdvantage = "What can't be easily copied?";
            let channels = "How will you reach customers?";
            let customerSegments = "Who are your target customers?";
            let costStructure = "What are your main costs?";
            let revenueStreams = "How will you make money?";

            // Smart extraction based on keywords
            if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning')) {
                solution = "AI-powered platform leveraging machine learning algorithms";
                uniqueValue = "Advanced AI technology that adapts and learns";
                unfairAdvantage = "Proprietary AI algorithms and data";
            }

            if (text.includes('skill') || text.includes('learn') || text.includes('education') || text.includes('course')) {
                problem = "Students and professionals struggle to identify relevant skills and learning paths aligned with market demands";
                solution = "AI-driven personalized learning platform that analyzes skills, career goals, and industry trends";
                customerSegments = "Students, professionals seeking career advancement, and companies looking for skilled talent";
                keyMetrics = "User growth, course completion rates, skill verification, job placement rates";
                channels = "Online marketing, partnerships with educational institutions, LinkedIn, job boards";
                revenueStreams = "Subscription fees, course sales, premium features, corporate partnerships";
                costStructure = "Platform development, AI infrastructure, content creation, marketing";
                uniqueValue = "Real-time job market integration and personalized skill recommendations";
                unfairAdvantage = "Proprietary algorithm that continuously adapts to market trends";
            }

            if (text.includes('market') || text.includes('job')) {
                channels = "Online platforms, social media, partnerships with employers";
            }

            return {
                problem: data.problem || problem,
                solution: data.solution || solution,
                keyMetrics: data.keyMetrics || keyMetrics,
                uniqueValue: data.uniqueValue || uniqueValue,
                unfairAdvantage: data.unfairAdvantage || unfairAdvantage,
                channels: data.channels || channels,
                customerSegments: data.customerSegments || customerSegments,
                costStructure: data.costStructure || costStructure,
                revenueStreams: data.revenueStreams || revenueStreams
            };
        }

        if (type === 'pitchDeck') {
            const title = data?.title || "Your Startup Name";
            const description = (data?.description || '').toLowerCase();

            // Smart generation based on description
            let problem = "The problem we're solving";
            let solution = "Our innovative solution";
            let market = "Market opportunity";
            let businessModel = "How we make money";
            let traction = "Current progress and milestones";
            let team = "Our amazing team";
            let ask = "What we're asking for";

            if (description.includes('skill') || description.includes('learn') || description.includes('education')) {
                problem = "Students and professionals struggle to identify relevant skills and learning paths aligned with market demands. Traditional education systems don't adapt quickly to industry needs, leaving skill gaps.";
                solution = `AI-driven personalized learning platform that analyzes individual skills, career goals, and real-time industry trends to recommend optimal learning paths and certifications.`;
                market = "The global online education market is valued at $350B+ and growing at 9% annually. With 70% of professionals seeking skill upgrades, there's massive demand for personalized learning solutions.";
                businessModel = "Freemium SaaS model: Free basic access, Premium subscriptions ($29/month), Enterprise partnerships, Course marketplace commissions (20-30%), Certification fees.";
                traction = "Currently in MVP phase with 500+ beta users, partnerships with 3 educational institutions, and integration with major job platforms.";
                team = "Experienced team of 8 with backgrounds in AI/ML, education technology, and business development.";
                ask = "Seeking $500K seed funding to scale platform, expand content library, and accelerate user acquisition.";
            } else if (description.includes('ai') || description.includes('artificial intelligence')) {
                problem = "Businesses struggle to leverage AI effectively due to complexity, high costs, and lack of expertise.";
                solution = `AI-powered platform that makes advanced AI accessible through intuitive interfaces and automated workflows.`;
                market = "The AI market is projected to reach $1.8T by 2030. Small and medium businesses represent a $200B+ opportunity.";
                businessModel = "SaaS subscriptions ($99-$999/month tiers), API usage fees, Enterprise contracts, White-label licensing.";
                traction = "Launched 6 months ago with 200+ active customers, $50K MRR, and 95% customer satisfaction.";
                team = "Team of 12 including AI researchers, software engineers, and sales professionals.";
                ask = "Raising $2M Series A to expand engineering team, enhance AI capabilities, and scale marketing.";
            } else {
                // Generic smart defaults
                problem = "Current solutions in the market are inefficient, expensive, or don't address core customer needs effectively.";
                solution = `${title} provides an innovative approach that solves these challenges through technology and user-centric design.`;
                market = "The target market represents a significant opportunity with growing demand and limited effective solutions.";
                businessModel = "Revenue streams include subscription fees, transaction commissions, premium features, and enterprise licensing.";
                traction = "Early traction includes initial user base, positive feedback, and key partnerships in development.";
                team = "Experienced founding team with relevant industry expertise and proven track record.";
                ask = "Seeking funding to accelerate product development, expand team, and scale operations.";
            }

            return {
                title: title,
                problem: data?.problem || problem,
                solution: data?.solution || solution,
                market: data?.market || market,
                businessModel: data?.businessModel || businessModel,
                traction: data?.traction || traction,
                team: data?.team || team,
                ask: data?.ask || ask
            };
        }

        // Default fallback for any other type
        return {
            title: data?.title || "Your Startup Name",
            problem: "The problem we're solving",
            solution: "Our innovative solution",
            market: "Market opportunity",
            businessModel: "How we make money",
            traction: "Current progress and milestones",
            team: "Our amazing team",
            ask: "What we're asking for"
        };
    } catch (mockError) {
        console.error("Error in generateSmartMock:", mockError);
        // Ultimate fallback
        return {
            title: data?.title || "Your Startup Name",
            problem: "The problem we're solving",
            solution: "Our innovative solution",
            market: "Market opportunity",
            businessModel: "How we make money",
            traction: "Current progress and milestones",
            team: "Our amazing team",
            ask: "What we're asking for"
        };
    }
};

// @route   POST api/ai/validate
router.post('/validate', async (req, res) => {
    try {
        const { idea, description } = req.body;

        // Fallback condition
        if (!model) {
            console.log("Serving Smart Mock (Gemini unavailable)");
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
            return res.json(generateSmartMock('validate', { idea, description }));
        }

        const prompt = `Analyze this startup idea: "${idea}". Description: "${description}". 
        Provide a JSON response with the following structure:
        {
            "viabilityScore": number (0-100),
            "analysis": {
                "strengths": [string array],
                "weaknesses": [string array],
                "suggestions": [string array],
                "marketPotential": string
            }
        }
        Do not include markdown formatting.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        // safely parse JSON
        let parsedData;
        try {
            parsedData = JSON.parse(text);
        } catch (jsonErr) {
            console.error("JSON Parse Error from Gemini:", jsonErr);
            throw new Error("Invalid JSON from AI"); // Trigger catch block
        }

        return res.json(parsedData);

    } catch (err) {
        console.error("AI Route Error:", err.message);
        // Prevent "headers already sent" error
        if (!res.headersSent) {
            return res.json(generateSmartMock('validate', req.body));
        }
    }
});

// @route   POST api/ai/roadmap
router.post('/roadmap', async (req, res) => {
    try {
        const { title, type } = req.body;

        if (!model) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return res.json(generateSmartMock('roadmap', { title, type }));
        }

        const prompt = `Create a detailed 3-phase launch roadmap for a specific project: "${title}" (${type}). 
        Description context: "${req.body.description || ''}".
        Generate highly specific steps relevant to this exact project type, not generic ones.
        Provide a JSON response with structure:
        {
            "title": string,
            "phases": [
                { "name": string, "duration": string, "steps": [string array of 3-4 specific items] }
            ]
        }
        Do not include markdown formatting.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        let parsedData;
        try {
            parsedData = JSON.parse(text);
        } catch (jsonErr) {
            console.error("JSON Parse Error from Gemini:", jsonErr);
            throw new Error("Invalid JSON from AI");
        }

        return res.json(parsedData);

    } catch (err) {
        console.error("AI Route Error:", err.message);
        if (!res.headersSent) {
            return res.json(generateSmartMock('roadmap', req.body));
        }
    }
});

// @route   POST api/ai/lean-canvas
// @desc    Generate Lean Canvas using AI chat
// @access  Public
router.post('/lean-canvas', async (req, res) => {
    try {
        const { conversation, projectData } = req.body;

        // Handle case where conversation might be array of strings or array of objects
        let conversationText = '';
        if (Array.isArray(conversation)) {
            conversationText = conversation.map(c => typeof c === 'string' ? c : c.content || c.text || '').join('\n');
        } else if (typeof conversation === 'string') {
            conversationText = conversation;
        }

        if (!model) {
            console.log("Serving Smart Mock for Lean Canvas (Gemini unavailable)");
            await new Promise(resolve => setTimeout(resolve, 800));
            return res.json(generateSmartMock('leanCanvas', { conversation: conversationText, ...(projectData || {}) }));
        }

        const prompt = `Based on this conversation about a startup idea: "${conversationText}", 
        generate a comprehensive Lean Canvas in JSON format:
        {
            "problem": string (describe the top 3 problems customers face),
            "solution": string (describe your unique solution),
            "keyMetrics": string (what metrics will you track),
            "uniqueValue": string (what makes your solution unique),
            "unfairAdvantage": string (what can't be easily copied),
            "channels": string (how will you reach customers),
            "customerSegments": string (who are your target customers),
            "costStructure": string (what are your main costs),
            "revenueStreams": string (how will you make money)
        }
        Return ONLY valid JSON, no markdown formatting, no code blocks.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        // Remove any leading/trailing whitespace and try to extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }

        let parsedData;
        try {
            parsedData = JSON.parse(text);
        } catch (jsonErr) {
            console.error("JSON Parse Error:", jsonErr);
            console.error("Raw AI response:", text);
            throw new Error("Invalid JSON from AI");
        }

        return res.json(parsedData);

    } catch (err) {
        console.error("AI Route Error:", err.message);
        if (!res.headersSent) {
            const { conversation, projectData } = req.body;
            let conversationText = '';
            if (Array.isArray(conversation)) {
                conversationText = conversation.map(c => typeof c === 'string' ? c : c.content || c.text || '').join('\n');
            } else if (typeof conversation === 'string') {
                conversationText = conversation;
            }
            return res.json(generateSmartMock('leanCanvas', { conversation: conversationText, ...(projectData || {}) }));
        }
    }
});

// @route   POST api/ai/pitch-deck
// @desc    Generate Pitch Deck content
// @access  Public
router.post('/pitch-deck', async (req, res) => {
    let responseSent = false;

    // Helper function to safely get mock data
    const getMockData = (projectData) => {
        try {
            return generateSmartMock('pitchDeck', projectData || {});
        } catch (mockErr) {
            console.error("Error generating mock data:", mockErr);
            // Return basic fallback data
            return {
                title: projectData?.title || "Your Startup Name",
                problem: "The problem we're solving",
                solution: "Our innovative solution",
                market: "Market opportunity",
                businessModel: "How we make money",
                traction: "Current progress and milestones",
                team: "Our amazing team",
                ask: "What we're asking for"
            };
        }
    };

    try {
        const { projectData } = req.body;
        console.log("Pitch Deck Request:", {
            hasProjectData: !!projectData,
            title: projectData?.title,
            hasDescription: !!projectData?.description
        });

        // Validate request body
        if (!projectData || (!projectData.title && !projectData.description)) {
            responseSent = true;
            const mockData = getMockData(projectData);
            return res.status(400).json({
                error: 'Invalid request',
                msg: 'Project title or description is required',
                ...mockData
            });
        }

        // Check if model is available, otherwise use mock
        if (!model) {
            console.log("Serving Smart Mock for Pitch Deck (Gemini unavailable)");
            await new Promise(resolve => setTimeout(resolve, 1000));
            responseSent = true;
            const mockData = getMockData(projectData);
            console.log("Sending mock data:", Object.keys(mockData));
            return res.json(mockData);
        }

        // Double-check model is valid before using
        if (typeof model.generateContent !== 'function') {
            console.log("Model is not properly initialized. Using Smart Mock.");
            responseSent = true;
            const mockData = getMockData(projectData);
            return res.json(mockData);
        }

        const prompt = `Create a pitch deck for: "${projectData?.title || 'Startup'}". 
        Description: "${projectData?.description || ''}".
        Provide JSON response:
        {
            "title": string,
            "problem": string,
            "solution": string,
            "market": string,
            "businessModel": string,
            "traction": string,
            "team": string,
            "ask": string
        }
        Return ONLY valid JSON, no markdown formatting, no code blocks.`;

        let result, response, text;
        try {
            result = await model.generateContent(prompt);
            if (!result || !result.response) {
                throw new Error("Invalid response from Gemini API");
            }
            response = await result.response;
            if (!response || typeof response.text !== 'function') {
                throw new Error("Invalid response object from Gemini API");
            }
            text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            if (!text || text.length === 0) {
                throw new Error("Empty response from Gemini API");
            }
        } catch (apiErr) {
            console.error("Gemini API Error:", apiErr.message);
            console.error("API Error details:", apiErr);
            // Fall back to mock data
            if (!responseSent && !res.headersSent) {
                responseSent = true;
                const mockData = getMockData(projectData);
                console.log("Sending mock data after API error:", Object.keys(mockData));
                return res.json(mockData);
            }
        }

        // Remove any leading/trailing whitespace and try to extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }

        let parsedData;
        try {
            parsedData = JSON.parse(text);
            console.log("Successfully parsed AI response:", Object.keys(parsedData));
        } catch (jsonErr) {
            console.error("JSON Parse Error:", jsonErr);
            console.error("Raw AI response:", text);
            // Fall back to mock data instead of throwing error
            if (!responseSent && !res.headersSent) {
                responseSent = true;
                const mockData = getMockData(projectData);
                console.log("Sending mock data after JSON parse error:", Object.keys(mockData));
                return res.json(mockData);
            }
        }

        // Ensure we always send a response
        if (!responseSent && !res.headersSent) {
            responseSent = true;
            console.log("Sending parsed AI data:", Object.keys(parsedData));
            return res.json(parsedData);
        } else {
            // Response already sent, log warning
            console.warn("Response already sent, but reached end of try block");
        }

    } catch (err) {
        console.error("AI Route Error:", err.message);
        console.error("Error stack:", err.stack);

        if (!responseSent && !res.headersSent) {
            try {
                // Always return mock data on error
                const mockData = getMockData(req.body?.projectData);
                console.log("Sending error response with mock data:", Object.keys(mockData));
                return res.status(500).json({
                    error: 'Server Error',
                    msg: err.message || 'Failed to generate pitch deck',
                    ...mockData
                });
            } catch (sendErr) {
                console.error("Failed to send error response:", sendErr);
                // Last resort - try to send a basic error response
                if (!res.headersSent) {
                    try {
                        const fallbackData = {
                            error: 'Server Error',
                            msg: 'An unexpected error occurred',
                            title: req.body?.projectData?.title || "Your Startup Name",
                            problem: "Unable to generate content at this time.",
                            solution: "Please try again later.",
                            market: "Market opportunity",
                            businessModel: "Business model",
                            traction: "Traction",
                            team: "Team",
                            ask: "The Ask"
                        };
                        console.log("Sending fallback error response:", Object.keys(fallbackData));
                        return res.status(500).json(fallbackData);
                    } catch (finalErr) {
                        console.error("Failed to send final error response:", finalErr);
                    }
                }
            }
        } else {
            console.error("Cannot send error response - headers already sent or response already sent");
        }
    }
});

module.exports = router;

import { useState } from 'react';
import { useToolContext } from '@/contexts/ToolContext';
import { DocumentView } from './DocumentView';
import { ToolDetail } from './ToolDetail';

const exampleJson = {
    "business_profile": {
        "business_name": "HydroJug",
        "short_description": "Hydration products for active lifestyles",
        "long_description": "HydroJug offers a range of hydration products designed for active lifestyles. Their products include the 32oz Sport Bottle, Pro Jug, and various Traveler sizes, all featuring leakproof designs, cupholder compatibility, and hygienic flip straws. The company emphasizes quality and functionality, providing BPA-free, dishwasher-safe products with a lifetime guarantee. HydroJug also offers customization options and a variety of accessories to personalize the hydration experience.",
        "objectives": [
            "Provide high-quality hydration solutions",
            "Expand product customization options",
            "Enhance customer engagement through promotions"
        ],
        "mission_statement": "To redefine hydration with innovative, high-quality products that support active lifestyles.",
        "vision_statement": "To be the leading provider of hydration solutions for active individuals worldwide."
    },
    "business_model_canvas": {
        "value_proposition": "Leakproof, customizable hydration products with a focus on quality and functionality.",
        "customer_segments": "Active individuals seeking reliable hydration solutions.",
        "channels": "Online store, newsletters, and promotions.",
        "customer_relationships": "Engagement through newsletters, promotions, and a lifetime guarantee.",
        "revenue_streams": "Sales of hydration products and accessories.",
        "key_resources": "Patented product designs, online platform, and customer service team.",
        "key_activities": "Product development, marketing, and customer engagement.",
        "key_partnerships": "Suppliers of BPA-free materials and manufacturing partners.",
        "cost_structure": "Fixed costs for manufacturing and variable costs for marketing and promotions."
    },
    "product_service_descriptions": {
        "products": [
            {
                "name": "32oz Sport Bottle",
                "description": "Built for active lifestyles, keeping you hydrated wherever you go."
            },
            {
                "name": "Pro Jug",
                "description": "Half-gallon hydration companion with flip-up straw lid, durable shatterproof design, BPA-free materials, and dishwasher safe."
            },
            {
                "name": "Traveler",
                "description": "40oz Tumbler, leakproof, cupholder compatible, hygienic circular flip straw, durable and insulated."
            }
        ],
        "services": [
            {
                "name": "Customization",
                "description": "Personalize your Stainless HydroJug for a unique touch."
            }
        ]
    },
    "social_media_strategy": {
        "social_media_presence": "Active on YouTube, TikTok, Twitch, and podcasts on Apple Store and Spotify.",
        "content_strategy_insights": "AI-driven influencer matching, automated translations, viewer behavior analysis, and content creation assistance.",
        "engagement_metrics": "In-house influencer metrics and comprehensive dashboards for detailed analysis.",
        "brand_voice_and_messaging": "Forward-thinking, tech-savvy, emphasizing efficiency, transparency, and empowerment through AI and blockchain."
    },
    "competitor_analysis": {
        "competitors": [
            {
                "name": "The Mortgage Office",
                "market_positioning": "Comprehensive loan servicing software for private lenders.",
                "competitive_advantages": "High-quality, widely used by reputable private lenders.",
                "market_analysis": "Strong presence in the private lending sector with a focus on loan origination, servicing, trust accounting, and investor management."
            },
            {
                "name": "LendingPad",
                "market_positioning": "Web-based mortgage loan origination system.",
                "competitive_advantages": "User-friendly interface and affordability.",
                "market_analysis": "Popular choice among mortgage professionals for secure, compliant, and efficient solutions."
            },
            {
                "name": "Mortgage Automator",
                "market_positioning": "End-to-end loan origination and servicing software for private lenders.",
                "competitive_advantages": "Advanced features to streamline the lending process.",
                "market_analysis": "Enhances efficiency and compliance in the North American market."
            }
        ]
    }
};

const blankJson = {
    "business_profile": { "business_name": "Company Name" },
    "business_model_canvas": {},
    "product_service_descriptions": {},
    "social_media_strategy": {},
    "competitor_analysis": {}
};

export function LeftPanel() {
    const { selectedTool, setSelectedTool, document, setDocument } = useToolContext();
    // const [documentContent, setDocumentContent] = useState<string>("");

    return (
        <div className="w-[800px] border-r border-gray-200">
            {selectedTool ? (
                <ToolDetail
                    tool={selectedTool}
                    onClose={() => setSelectedTool(null)}
                />
            ) : (
                <DocumentView
                    content={document || JSON.stringify(blankJson, null, 2)}
                    onUpdate={setDocument}
                    isEditable={true}
                />
            )}
        </div>
    );
} 
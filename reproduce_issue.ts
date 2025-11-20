
import { parseCampaignStep1Prompt } from './src/lib/campaigns/step1';

const testCases = [
    // Case: Multiple creators with different followers
    "Launch 3 live streams: creators at 100k, 200k and 500k followers",
];

// Helper function from CreateCampaign.tsx (simplified)
function formatFollowersRange(live: { followersMin: number | null; followersMax: number | null }): string {
    if (live.followersMin === null && live.followersMax === null) {
        return '';
    }

    if (live.followersMin !== null && live.followersMax !== null) {
        if (live.followersMin === live.followersMax) {
            return formatFollowerNumber(live.followersMin);
        }
        return `${formatFollowerNumber(live.followersMin)} - ${formatFollowerNumber(live.followersMax)}`;
    }

    if (live.followersMin !== null) {
        return `${formatFollowerNumber(live.followersMin)}+`;
    }

    if (live.followersMax !== null) {
        return `up to ${formatFollowerNumber(live.followersMax)}`;
    }

    return '';
}

function formatFollowerNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toString();
}

async function runTests() {
    console.log("Running tests...\n");

    for (const prompt of testCases) {
        console.log(`Prompt: "${prompt}"`);
        const result = parseCampaignStep1Prompt(prompt);

        console.log("Total Lives:", result.totalLives);

        if (result.lives.length > 0) {
            console.log("Lives Details:");
            result.lives.forEach(live => {
                console.log(`  Live ${live.index}: Followers [${live.followersMin}, ${live.followersMax}]`);
            });

            // Simulate New Tag Display Logic
            console.log("Tag Display Simulation:");
            if (result.criteria.followers === 'valid' && result.lives.length > 0) {
                // Obter todos os valores formatados
                const allFollowers = result.lives.map(live => formatFollowersRange(live));

                // Remover duplicatas mantendo a ordem
                const uniqueFollowers = Array.from(new Set(allFollowers));

                // Juntar com vírgula
                const displayValue = uniqueFollowers.join(', ');
                console.log(`  Displayed Value: "${displayValue}"`);
            }
        }
        console.log("-".repeat(50) + "\n");
    }
}

runTests();

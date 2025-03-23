// Add proof generation logic
document.getElementById("proofBtn").addEventListener("click", async function () {
    const proofBtn = document.getElementById("proofBtn");
    proofBtn.disabled = true;

    try {
        // Validate score
        if (SCORE <= 0) {
            alert("Cannot generate proof for score 0 or negative. Please play the game first!");
            proofBtn.disabled = false;
            return;
        }

        console.log("Requesting core proof generation for score:", SCORE);

        const response = await fetch("http://65.109.86.103:3005/api/generate-proof", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score: SCORE }),
        });

        if (!response.ok) {
            throw new Error(
                "An error occurred while generating the proof on the server."
            );
        }

        const data = await response.json();
        alert("Core Proof generated successfully!\nProof ID: " + data.proofId);
        console.log("Generated Core Proof:", data);
    } catch (err) {
        console.error("Core proof generation error:", err);
        alert("Failed to generate Core Proof.");
    } finally {
        proofBtn.disabled = false;
    }
}); 
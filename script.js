let myConfetti = null;

window.addEventListener("load", () => {
    console.log("🎨 Window loaded, creating confetti canvas");
    const confettiCanvas = document.createElement("canvas");
    confettiCanvas.id = "confetti-canvas";
    confettiCanvas.style.position = "fixed";
    confettiCanvas.style.inset = "0";
    confettiCanvas.style.width = "100vw";
    confettiCanvas.style.height = "100vh";
    confettiCanvas.style.pointerEvents = "none";
    confettiCanvas.style.zIndex = "999999";

    document.body.appendChild(confettiCanvas);

    myConfetti = confetti.create(confettiCanvas, {
        resize: true,
        useWorker: false
    });
    console.log("✅ Confetti initialized:", myConfetti);
});



// STAGE 1

if (document.getElementById("questions")) {

    const questionsData = [
        { q: "Bana aldığın ilk hediye?", a: "JÜLİDE", key: "A" },
        { q: "Şarkımız?", a: "BEN VARIM", key: "B" },
        { q: "En sevdiğimiz aktivite?", a: "YÜRÜYÜŞ", key: "İ" },
        { q: "Beni ilk kıskandığın an?", a: "PİKNİK", key: "U" },
        { q: "İlk oynadığımız oyun?", a: "101 PLUS", key: "M" },
        { q: "İlk birlikte uyuyakaldığımız yer?", a: "ÇALIŞ", key: "D" },
        { q: "Benzediğimiz hayvan?", a: "SİNCAP", key: "B" }
    ];

    const finalWord = "BUMBADİ";

    const letterPopup = document.getElementById("letterPopup");
    const popupLetter = document.getElementById("popupLetter");
    const questionsDiv = document.getElementById("questions");
    const passwordArea = document.getElementById("passwordArea");
    const letterPool = document.getElementById("letterPool");
    const stageComplete = document.getElementById("stageComplete");
    const goStage2Btn = document.getElementById("goStage2");

    letterPopup.classList.add("hidden");
    let celebrated = false;

    finalWord.split("").forEach(() => {
        const box = document.createElement("div");
        box.addEventListener("dragover", e => e.preventDefault());
        box.addEventListener("drop", e => dropLetter(e, box));
        passwordArea.appendChild(box);
    });

    questionsData.forEach(item => {
        const box = document.createElement("div");
        box.className = "question-box";

        const p = document.createElement("p");
        p.textContent = item.q;

        const lettersDiv = document.createElement("div");
        lettersDiv.className = "letters";

        item.a.split("").forEach(char => {

            if (char === " ") {
                const space = document.createElement("div");
                space.className = "space";
                lettersDiv.appendChild(space);
                return;
            }

            const input = document.createElement("input");
            input.maxLength = 1;

            input.addEventListener("input", () => {
                const val = input.value.toUpperCase();

                if (val === char) {
                    input.classList.add("correct");
                    input.disabled = true;

                    let next = input.nextElementSibling;
                    while (next && next.tagName !== "INPUT") {
                        next = next.nextElementSibling;
                    }
                    if (next) next.focus();

                    checkComplete(lettersDiv, item.key);
                } else {
                    input.classList.add("wrong");
                    setTimeout(() => {
                        input.classList.remove("wrong");
                        input.value = "";
                    }, 300);
                }
            });

            lettersDiv.appendChild(input);
        });

        box.appendChild(p);
        box.appendChild(lettersDiv);
        questionsDiv.appendChild(box);
    });

    function checkComplete(container, key) {
        const inputs = [...container.querySelectorAll("input")];
        const done = inputs.every(i => i.disabled);

        if (done && !container.dataset.done) {
            container.dataset.done = "true";

            popupLetter.textContent = key;
            letterPopup.classList.remove("hidden");

            letterPopup.onclick = () => {
                letterPopup.classList.add("hidden");

                const l = document.createElement("div");
                l.className = "letter";

                const id = "letter-" + Date.now() + Math.random();
                l.textContent = key;
                l.id = id;
                l.draggable = true;

                l.addEventListener("dragstart", e => {
                    e.dataTransfer.setData("text/plain", id);
                });

                letterPool.appendChild(l);
                letterPopup.onclick = null;
            };
        }
    }

    function dropLetter(e, box) {
        e.preventDefault();

        if (box.dataset.locked === "true") return;

        const letterId = e.dataTransfer.getData("text/plain");
        const letterEl = document.getElementById(letterId);
        if (!letterEl) return;

        const droppedLetter = letterEl.textContent;
        const index = [...passwordArea.children].indexOf(box);
        const correctLetter = finalWord[index];

        if (droppedLetter === correctLetter) {
            box.textContent = droppedLetter;
            box.classList.add("filled");
            box.dataset.locked = "true";
            letterEl.remove();
        } else {
            box.classList.add("shake");
            setTimeout(() => box.classList.remove("shake"), 350);
        }

        checkFinal();
    }

    function checkFinal() {
        const attempt = [...passwordArea.children]
            .map(b => b.textContent)
            .join("");

        if (attempt === finalWord && !celebrated) {
            celebrated = true;

            myConfetti({
                particleCount: 150,
                angle: 60,
                spread: 70,
                startVelocity: 45,
                origin: { x: 0.02, y: 0.6 },
                colors: ["#f4a9b8", "#ffd6e0", "#ffffff"]
            });

            myConfetti({
                particleCount: 150,
                angle: 120,
                spread: 70,
                startVelocity: 45,
                origin: { x: 0.98, y: 0.6 },
                colors: ["#f4a9b8", "#ffd6e0", "#ffffff"]
            });

            stageComplete.classList.remove("hidden");
        }
    }

    goStage2Btn.onclick = () => {
        window.location.href = "stage2.html";
    };
}

// STAGE 2 

if (document.querySelector(".timeline")) {

    let draggedElement = null;
    let lives = 3;
    const hearts = document.querySelectorAll(".heart");

    function loseLife() {
        if (lives > 0) {
            lives--;
            hearts[lives].classList.add("lost");

            if (lives === 0) {
                setTimeout(() => {
                    document.getElementById("gameOverPanel").classList.remove("hidden");
                }, 300);
            }
        }
    }

    document.querySelectorAll(".event").forEach(event => {
        event.addEventListener("dragstart", e => {
            draggedElement = event;
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", event.dataset.id);
            event.style.opacity = "0.5";
        });

        event.addEventListener("dragend", e => {
            event.style.opacity = "1";
        });
    });

    document.querySelectorAll(".drop-zone").forEach(zone => {

        zone.addEventListener("dragover", e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        });

        zone.addEventListener("dragenter", e => {
            e.preventDefault();
            zone.style.transform = "scale(1.05)";
        });

        zone.addEventListener("dragleave", e => {
            zone.style.transform = "scale(1)";
        });

        zone.addEventListener("drop", e => {
            e.preventDefault();
            zone.style.transform = "scale(1)";

            const draggedId = e.dataTransfer.getData("text/plain");
            const slot = zone.closest(".time-slot");

            if (!draggedElement || !slot) return;

            if (slot.classList.contains("filled")) return;

            if (slot.dataset.answer === draggedId) {
                console.log("Correct match:", draggedId, "->", slot.dataset.answer);
                zone.textContent = "";
                zone.appendChild(draggedElement);
                draggedElement.draggable = false;
                draggedElement.style.opacity = "1";
                draggedElement.style.cursor = "default";
                slot.classList.add("filled");
                draggedElement = null;
                checkStage2Complete();
            }
            else {
                console.log("Wrong match:", draggedId, "!=", slot.dataset.answer);
                zone.dataset.correct = "false";
                loseLife();
                slot.classList.add("shake");
                setTimeout(() => slot.classList.remove("shake"), 400);
            }
        });
    });

    function checkStage2Complete() {
        const totalSlots = document.querySelectorAll(".time-slot").length;
        const filledSlots = document.querySelectorAll(".time-slot.filled").length;

        console.log("Stage 2 Check - filled:", filledSlots, "total:", totalSlots);

        if (filledSlots === totalSlots) {
            console.log("Stage 2 Complete!");
            completeStage2();
        }
    }



    function completeStage2() {
        console.log("completeStage2 called");

        showStage2SuccessModal();
    }

    function showStage2SuccessModal(skipConfetti) {
        console.log("showStage2SuccessModal called, skipConfetti:", skipConfetti);

        const modal = document.getElementById("stage2SuccessModal");
        const keyImage = document.getElementById("stage2Key");

        console.log("Modal element:", modal);
        console.log("Key image element:", keyImage);

        if (keyImage) keyImage.classList.remove("hidden");
        if (modal) {
            console.log("Removing hidden class from modal");
            modal.classList.remove("hidden");
        }

        if (!skipConfetti && myConfetti) {
            console.log("Firing confetti! myConfetti:", myConfetti);
            myConfetti({
                particleCount: 80,
                spread: 120,
                origin: { x: 0.1, y: 0.6 },
                colors: ["#f4a9b8", "#ffd6e0", "#ffffff"]
            });

            myConfetti({
                particleCount: 80,
                spread: 120,
                origin: { x: 0.9, y: 0.6 },
                colors: ["#f4a9b8", "#ffd6e0", "#ffffff"]
            });
        } else {
            console.log("Confetti not fired. skipConfetti:", skipConfetti, "myConfetti:", myConfetti);
        }
    }

    const goStage3Btn = document.getElementById("goStage3");
    if (goStage3Btn) {
        goStage3Btn.onclick = () => {
            window.location.href = "stage3.html";
        };
    }
}

// STAGE 3: MEMORY GAME

if (document.getElementById("memoryGame")) {
    console.log("🎴 Stage 3 Memory Game loaded");

    const gameContainer = document.getElementById("memoryGame");

    const cardImages = [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6];

    // TIMER
    const timerText = document.getElementById("timerText");
    let timeLeft = 60;
    let timerInterval = null;
    let timerStarted = false;


    let flippedCards = [];
    let matchedPairs = 0;
    let canFlip = true;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const shuffledCards = shuffle([...cardImages]);

    shuffledCards.forEach((imageNum, index) => {
        const card = document.createElement("div");
        card.className = "memory-card";
        card.dataset.image = imageNum;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="card-face card-back">❤️</div>
            <div class="card-face card-front">
                <img src="assets/${imageNum}.jpeg" alt="Kart ${imageNum}">
            </div>
        `;

        card.addEventListener("click", () => flipCard(card));
        gameContainer.appendChild(card);
    });

    function flipCard(card) {

        // TIMER İLK KARTTA BAŞLASIN
        if (!timerStarted) {
            timerStarted = true;
            startTimer();
        }

        if (!canFlip || card.classList.contains("flipped") || card.classList.contains("matched")) {
            return;
        }

        card.classList.add("flipped");
        flippedCards.push(card);

        console.log("Card flipped:", card.dataset.image, "Total flipped:", flippedCards.length);

        if (flippedCards.length === 2) {
            canFlip = false;
            checkMatch();
        }
    }


    function checkMatch() {
        const [card1, card2] = flippedCards;
        const image1 = card1.dataset.image;
        const image2 = card2.dataset.image;

        if (image1 === image2) {
            console.log("Match found!", image1);

            // Eşleşme animasyonu
            setTimeout(() => {
                card1.classList.add("matched");
                card2.classList.add("matched");
                matchedPairs++;

                console.log("Matched pairs:", matchedPairs, "/6");

                flippedCards = [];
                canFlip = true;

                // Tüm çiftler eşleşti mi?
                if (matchedPairs === 6) {
                    completeStage3();
                }
            }, 600);
        } else {
            console.log("No match:", image1, "vs", image2);

            // Yanlış eşleşme - kartları geri çevir
            card1.classList.add("wrong");
            card2.classList.add("wrong");

            setTimeout(() => {
                card1.classList.remove("flipped", "wrong");
                card2.classList.remove("flipped", "wrong");
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;

            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;

            timerText.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                showStage3GameOver();
            }
        }, 1000);
    }

    function showStage3GameOver() {
        canFlip = false;

        const gameOver = document.getElementById("stage3GameOver");
        if (gameOver) {
            gameOver.classList.remove("hidden");
        }
    }


    function completeStage3() {
        clearInterval(timerInterval);
        console.log("Stage 3 Complete!");

        setTimeout(() => {
            const modal = document.getElementById("stage3SuccessModal");
            if (modal) {
                modal.classList.remove("hidden");
            }

            if (myConfetti) {
                myConfetti({
                    particleCount: 100,
                    spread: 120,
                    origin: { x: 0.5, y: 0.6 },
                    colors: ["#f4a9b8", "#ffd6e0", "#ffffff"]
                });
            }
        }, 500);
    }

    const goStage4Btn = document.getElementById("goStage4");
    if (goStage4Btn) {
        goStage4Btn.onclick = () => {
            window.location.href = "stage4.html";
        };
    }
}


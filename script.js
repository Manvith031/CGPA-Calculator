document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const wizardScreen = document.getElementById('wizard-screen');
    const resultScreen = document.getElementById('result-screen');
    const finalResultScreen = document.getElementById('final-result-screen');

    // Store all screens in an array for easier management
    const allScreens = [welcomeScreen, wizardScreen, resultScreen, finalResultScreen];

    const welcomeLabel = document.getElementById('welcome-label');
    const nameInput = document.getElementById('name-input');
    const startButton = document.getElementById('start-button');
    const themeToggleButton = document.getElementById('theme-toggle');
    const instructionsButton = document.getElementById('instructions-button');
    const marksForm = document.getElementById('marks-form');
    const calculateButton = document.getElementById('calculate-button');
    const spinnerContainer = resultScreen.querySelector('.spinner-container'); // Get the container
    const spinner = document.getElementById('spinner');
    const loadingLabel = document.getElementById('loading-label');
    const revealButton = document.getElementById('reveal-button');
    const finalResultLabel = document.getElementById('final-result-label');
    const showBreakdownButton = document.getElementById('show-breakdown-button');
    const backToMainButton = document.getElementById('back-to-main-button');

    const instructionModal = document.getElementById('instruction-modal');
    const breakdownModal = document.getElementById('breakdown-modal');
    const closeModalButtons = document.querySelectorAll('.close-button');

    // --- Application State ---
    let username = "User";
    let breakdownData = {};
    let sgpaValue = 0;
    // Retrieve theme from localStorage or default to 'light'
    let currentTheme = localStorage.getItem('theme') || 'light'; 
    let enteredMarks = {}; // Stores {subjectKey: {cie: value, sem: value}}

    const subjects = [
        {"key": "math", "name": "Mathematics for CSE Stream I", "cie_hint": "CIE (out of 50)", "sem_hint": "End Sem (out of 100)", "credit": 4},
        {"key": "chem", "name": "Chemistry/Physics for CSE Stream", "cie_hint": "CIE (out of 50)", "sem_hint": "End Sem (out of 100)", "credit": 4},
        {"key": "caed", "name": "CAE Drawing/C Programming", "cie_hint": "CIE (out of 50)", "sem_hint": "End Sem (out of 100)", "credit": 3},
        {"key": "plc", "name": "Programming Language/Emerging Technology(PLC/ETC)", "cie_hint": "CIE (out of 50)", "sem_hint": "End Sem (out of 100)", "credit": 3},
        {"key": "esc", "name": "Engineering Science Course(ESC)", "cie_hint": "CIE (out of 50)", "sem_hint": "End Sem (out of 100)", "credit": 3},
        {"key": "eng", "name": "Professional Writing/Speaking Skill", "cie_hint": "CIE (out of 50)", "sem_hint": "End Sem (out of 50)", "credit": 1},
        {"key": "sfh", "name": "Scientific Foundation of Health/Prototype Fabrication Lab", "cie_hint": "CIE (out of 50)", "sem_hint": "End Sem (out of 50)", "credit": 1},
        {"key": "ico", "name": "Indian Constitution/Saamskruthika Kannada", "cie_hint": "CIE (out of 50)", "sem_hint": "End Sem (out of 50)", "credit": 1},
    ];

    // --- Helper Functions ---

    /**
     * Converts a mark (out of 100 or 50) to a 10-point score.
     * @param {number} mark The total mark.
     * @returns {number} The converted score.
     */
    function convertMarkToScore(mark) {
        if (mark === 0) return 0;
        if (mark < 10) return 1;
        if (mark < 20) return 2;
        if (mark < 30) return 3;
        if (mark < 40) return 4;
        if (mark < 50) return 5;
        if (mark < 60) return 6;
        if (mark < 70) return 7;
        if (mark < 80) return 8;
        if (mark < 90) return 9;
        return 10; // For mark >= 90
    }

    /**
     * Switches between screens by managing CSS classes.
     * @param {HTMLElement} currentScreen The screen currently active.
     * @param {HTMLElement} nextScreen The screen to activate.
     * @param {string} direction 'left' for next (forward), 'right' for previous (backward).
     */
    function switchScreen(currentScreen, nextScreen, direction = 'left') {
        // First, mark the current screen as inactive and set its direction
        currentScreen.classList.remove('active');
        if (direction === 'left') {
            currentScreen.classList.add('inactive-left');
        } else {
            currentScreen.classList.add('inactive-right');
        }

        // Then, remove all inactive classes from the next screen and make it active
        nextScreen.classList.remove('inactive-left', 'inactive-right');
        nextScreen.classList.add('active');

        // Optional: Ensure all other non-active screens are correctly set to inactive-right
        allScreens.forEach(screen => {
            if (screen !== currentScreen && screen !== nextScreen) {
                screen.classList.remove('active', 'inactive-left');
                screen.classList.add('inactive-right');
            }
        });
    }


    function showModal(modalElement) {
        modalElement.classList.add('show');
    }

    function hideModal(modalElement) {
        modalElement.classList.remove('show');
    }

    // --- Theme Toggling ---
    function toggleTheme() {
        if (currentTheme === 'light') {
            document.body.classList.add('dark-theme');
            currentTheme = 'dark';
        } else {
            document.body.classList.remove('dark-theme');
            currentTheme = 'light';
        }
        localStorage.setItem('theme', currentTheme); // Save theme preference
    }

    // --- Welcome Screen Logic ---
    function startApp() {
        username = nameInput.value.trim() || "User";
        welcomeLabel.style.transition = 'opacity 0.5s ease-out';
        welcomeLabel.style.opacity = '0'; // Fade out welcome label
        setTimeout(() => {
            switchScreen(welcomeScreen, wizardScreen, 'left');
            populateMarksForm(); // Populate form once wizard screen is active
        }, 500); // Wait for label to fade out
    }

    // --- Wizard Screen Logic ---
    function populateMarksForm() {
        marksForm.innerHTML = ''; // Clear previous inputs
        subjects.forEach(subject => {
            const subjectDiv = document.createElement('div');
            subjectDiv.classList.add('subject-input-group');

            // Get stored marks, if any, for pre-filling
            const storedCie = enteredMarks[subject.key] ? enteredMarks[subject.key].cie : '';
            const storedSem = enteredMarks[subject.key] ? enteredMarks[subject.key].sem : '';

            subjectDiv.innerHTML = `
                <label for="${subject.key}-cie">${subject.name}</label>
                <input type="number" id="${subject.key}-cie" placeholder="${subject.cie_hint}" min="0" max="50" value="${storedCie}" required>
                <input type="number" id="${subject.key}-sem" placeholder="${subject.sem_hint}" min="0" max="100" value="${storedSem}" required>
            `;
            marksForm.appendChild(subjectDiv);
        });
        // Add animation for new elements
        const subjectInputGroups = marksForm.querySelectorAll('.subject-input-group');
        subjectInputGroups.forEach((group, index) => {
            group.style.animationDelay = `${index * 0.05}s`;
            group.style.animation = 'fadeIn 0.5s ease-out forwards';
        });
    }

    function calculateSGPASubmission(event) {
        event.preventDefault(); // Prevent default form submission

        let isValid = true;
        let currentMarksAttempt = {}; // Temporarily store for validation

        subjects.forEach(subject => {
            const cieInput = document.getElementById(`${subject.key}-cie`);
            const semInput = document.getElementById(`${subject.key}-sem`);

            const cie = parseInt(cieInput.value);
            const sem = parseInt(semInput.value);

            // Basic validation
            if (isNaN(cie) || isNaN(sem) || cie < 0 || sem < 0 || cie > 50 || (["eng", "sfh", "ico"].includes(subject.key) ? sem > 50 : sem > 100)) {
                isValid = false;
                cieInput.style.borderColor = 'var(--error-color)';
                semInput.style.borderColor = 'var(--error-color)';
                alert(`Please enter valid marks for ${subject.name}.\nCIE (0-50), End Sem (0-${["eng", "sfh", "ico"].includes(subject.key) ? 50 : 100}).`);
                return; // Stop processing this subject and alert
            } else {
                // Reset border color if valid
                cieInput.style.borderColor = '';
                semInput.style.borderColor = '';
            }
            // Store valid marks to the temporary attempt
            currentMarksAttempt[subject.key] = { cie, sem };
        });

        if (!isValid) {
            return; // Stop if any validation failed
        }

        // If all valid, save to permanent storage and proceed
        enteredMarks = currentMarksAttempt;

        let totalWeighted = 0;
        let totalCredits = 0;
        breakdownData = {}; // Clear previous breakdown

        subjects.forEach(subject => {
            // Use marks from enteredMarks for calculation
            const { cie, sem } = enteredMarks[subject.key]; 
            let total;
            if (["eng", "sfh", "ico"].includes(subject.key)) {
                total = cie + sem;
            } else {
                // Assuming end sem marks are out of 100 and converted to 50 for total
                total = cie + (sem / 2); 
            }
            
            const convertedScore = convertMarkToScore(total);
            
            breakdownData[subject.name] = {
                "CIE": cie,
                "Sem": sem,
                "Total": total.toFixed(1), // Format to one decimal place
                "Converted": convertedScore,
                "Credit": subject.credit
            };
            totalWeighted += convertedScore * subject.credit;
            totalCredits += subject.credit;
        });

        sgpaValue = totalCredits ? (totalWeighted / totalCredits) : 0;

        // Initiate display of result screen with spinner
        switchScreen(wizardScreen, resultScreen, 'left');
        displayResult(sgpaValue);
    }

    function showInstructions() {
        showModal(instructionModal);
    }

    // --- Result Screen Logic (Spinner and Reveal Button Animation) ---
    function displayResult(sgpa) {
        sgpaValue = sgpa;
        
        // 1. Ensure spinner container is fully visible and displaying its contents
        spinnerContainer.style.opacity = '1';
        spinnerContainer.style.display = 'flex'; // Explicitly ensure flex layout
        
        // 2. Set initial loading text and hide the button
        loadingLabel.textContent = "Calculating SGPA...";
        revealButton.classList.remove('visible'); // Hide the button

        // 3. Simulate calculation time
        setTimeout(() => {
            // 4. Fade out spinner container and then hide it
            spinnerContainer.style.opacity = '0';
            // Wait for opacity transition to finish before setting display to 'none'
            setTimeout(() => {
                spinnerContainer.style.display = 'none';
            }, 500); // Matches the transition duration in CSS for opacity

            // 5. Update loading text and show the reveal button
            loadingLabel.textContent = "Calculation complete."; // Optional: text change after calculation
            revealButton.classList.add('visible'); // Show reveal button with pulse animation
        }, 2000); // Increased simulated calculation time to 2 seconds for clearer animation
    }

    function revealResult() {
        finalResultLabel.textContent = `Your SGPA is: ${sgpaValue.toFixed(2)}`;
        // Animate the label
        finalResultLabel.classList.remove('animated-in'); // Reset animation
        void finalResultLabel.offsetWidth; // Trigger reflow to restart animation
        finalResultLabel.classList.add('animated-in');

        switchScreen(resultScreen, finalResultScreen, 'left');
    }

    // --- Final Result Screen Logic ---
    function showBreakdown() {
        const breakdownContent = document.getElementById('breakdown-content');
        let breakdownHTML = '';
        if (Object.keys(breakdownData).length === 0) {
            breakdownHTML = '<p>No breakdown data available. Please calculate SGPA first.</p>';
        } else {
            for (const subj in breakdownData) {
                const info = breakdownData[subj];
                breakdownHTML += `
                    <p><strong>${subj}:</strong><br>
                    CIE: ${info.CIE}, Sem: ${info.Sem} (Total: ${info.Total}),<br>
                    Converted: ${info.Converted} x Credit ${info.Credit}</p>
                `;
            }
        }
        breakdownContent.innerHTML = breakdownHTML;
        showModal(breakdownModal);
    }

    function backToMarksEntry() { 
        populateMarksForm(); // This will now use `enteredMarks` to pre-fill inputs
        switchScreen(finalResultScreen, wizardScreen, 'right'); 
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', startApp);
    themeToggleButton.addEventListener('click', toggleTheme);
    instructionsButton.addEventListener('click', showInstructions);
    calculateButton.addEventListener('click', calculateSGPASubmission);
    revealButton.addEventListener('click', revealResult);
    showBreakdownButton.addEventListener('click', showBreakdown);
    backToMainButton.addEventListener('click', backToMarksEntry);

    closeModalButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            hideModal(event.target.closest('.modal'));
        });
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === instructionModal) {
            hideModal(instructionModal);
        }
        if (event.target === breakdownModal) {
            hideModal(breakdownModal);
        }
    });

    // Initial setup: Apply saved theme and ensure only the welcome screen is active on load
    function initializeApp() {
        // Apply saved theme on load
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }

        // Set initial screen states
        allScreens.forEach(screen => {
            screen.classList.remove('active', 'inactive-left', 'inactive-right');
            if (screen === welcomeScreen) {
                screen.classList.add('active');
            } else {
                screen.classList.add('inactive-right'); // All others start off-screen right
            }
        });
        welcomeLabel.style.transition = 'opacity 2s ease-out';
        welcomeLabel.style.opacity = '1';
    }

    initializeApp(); // Call this to set up screen states and theme on load
});
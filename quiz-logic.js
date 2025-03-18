/* Quiz Logic for Webflow to WordPress with Udesly */
console.log('Quiz script is active');

// Main variables
let filledState = true;
let weightResults = {
  resultA: 0,
  resultB: 0,
  resultC: 0
};

// Initialize the script
function initQuiz() {
  console.log('Quiz initialized');
  
  // Hide quiz name if present
  const quizName = document.querySelector('[quiz-attr="quiz-name"]');
  if (quizName) quizName.style.display = 'none';
  
  // Set up the forms and questions
  setupQuizForms();
  
  // Set up form show buttons
  setupFormShowers();
  
  // Set up custom styles for radio buttons and checkboxes
  setupCustomStyles();
  
  // Set up navigation buttons
  setupNavigationButtons();
}

// Set up quiz forms
function setupQuizForms() {
  const quizForms = document.querySelectorAll('[data-quiz-form]');
  
  quizForms.forEach((quizForm) => {
    // Turn off native form submission
    quizForm.addEventListener('submit', e => {
      e.preventDefault();
      e.stopPropagation();
    }, true);
    
    // Get all question steps (collection items)
    const questionSteps = quizForm.querySelectorAll('[data-quiz-step]');
    
    // Count actual questions (excluding final step)
    let questionsNumber = 0;
    questionSteps.forEach(step => {
      if (step.getAttribute('data-quiz-step') !== 'final') {
        questionsNumber++;
      }
    });
    
    // Update total questions display
    const totalQuestionsElements = quizForm.querySelectorAll('[data-quiz-total]');
    totalQuestionsElements.forEach(element => {
      element.innerHTML = questionsNumber;
    });
    
    // Create progress indicators
    createProgressIndicator(quizForm, questionsNumber);
    
    // Hide all questions except the first
    const questionStepsArray = Array.from(questionSteps);
    questionStepsArray.sort((a, b) => {
      const aStep = parseInt(a.getAttribute('data-quiz-step').replace('step-', '')) || 0;
      const bStep = parseInt(b.getAttribute('data-quiz-step').replace('step-', '')) || 0;
      return aStep - bStep;
    });
    
    for (let i = 0; i < questionStepsArray.length; i++) {
      questionStepsArray[i].style.display = 'none';
      if (i === 0) {
        questionStepsArray[i].style.display = 'block';
        questionStepsArray[i].classList.add('current-question');
        checkRequiredFields(questionStepsArray[i]);
      }
    }
  });
}

// Set up form show buttons
function setupFormShowers() {
  const formShowers = document.querySelectorAll('[data-quiz-show]');
  
  formShowers.forEach(formShower => {
    if (formShower.tagName !== 'A') return;
    
    const quizFormName = formShower.getAttribute('data-quiz-show');
    const splashScreen = formShower.closest('[data-quiz-splash]');
    
    formShower.addEventListener('click', function() {
      showForm(quizFormName, splashScreen);
    });
  });
}

// Show form on button click
function showForm(formName, splashScreen) {
  const quizForms = document.querySelectorAll('[data-quiz-form]');
  
  quizForms.forEach(quizForm => {
    const quizFormName = quizForm.getAttribute('data-quiz-form-name');
    if (quizFormName === formName) {
      quizForm.style.display = 'block';
      if (splashScreen) splashScreen.style.display = 'none';
      
      const currentQuestion = quizForm.querySelector('.current-question');
      checkRequiredFields(currentQuestion);
    }
  });
}

// Create progress indicator
function createProgressIndicator(quizForm, totalQuestions) {
  const progressBar = quizForm.querySelector('[data-quiz-progress-bar]');
  const progressStep = quizForm.querySelector('[data-quiz-progress-steps]');
  const progressCircle = quizForm.querySelector('[data-quiz-progress-circle]');
  
  if (progressBar) {
    // Initialize progress bar
    progressBar.style.width = (1 / totalQuestions * 100) + '%';
  }
  
  if (progressStep) {
    // Create step indicators
    const stepTemplate = progressStep.querySelector('[data-quiz-step-indicator]');
    
    for (let i = 1; i < totalQuestions; i++) {
      const newStep = stepTemplate.cloneNode(true);
      progressStep.appendChild(newStep);
    }
    
    // Mark first step as active
    const firstStep = progressStep.querySelector('[data-quiz-step-indicator]');
    firstStep.classList.add('active');
  }
  
  if (progressCircle) {
    // Initialize circle progress
    const current = progressCircle.querySelector('[data-quiz-current]');
    const total = progressCircle.querySelector('[data-quiz-total]');
    
    if (current) current.innerHTML = '1';
    if (total) total.innerHTML = totalQuestions;
  }
}

// Update progress indicator
function updateProgress(stepNumber, quizForm) {
  if (stepNumber === 'final') {
    const progressWrapper = quizForm.querySelector('[data-quiz-progress-wrapper]');
    if (progressWrapper) progressWrapper.style.display = 'none';
    return;
  }
  
  const currentStep = parseInt(stepNumber.replace('step-', ''));
  const questionSteps = quizForm.querySelectorAll('[data-quiz-step]');
  
  let totalSteps = 0;
  questionSteps.forEach(step => {
    if (step.getAttribute('data-quiz-step') !== 'final') {
      totalSteps++;
    }
  });
  
  const progress = (currentStep / totalSteps) * 100;
  
  // Update progress bar
  const progressBar = quizForm.querySelector('[data-quiz-progress-bar]');
  if (progressBar) {
    progressBar.style.width = progress + '%';
  }
  
  // Update step indicators
  const stepIndicators = quizForm.querySelectorAll('[data-quiz-step-indicator]');
  if (stepIndicators.length > 0) {
    for (let i = 0; i < stepIndicators.length; i++) {
      if (i < currentStep) {
        stepIndicators[i].classList.add('active');
      }
    }
  }
  
  // Update circle progress
  const progressCircle = quizForm.querySelector('[data-quiz-progress-circle]');
  if (progressCircle) {
    const current = progressCircle.querySelector('[data-quiz-current]');
    if (current) current.innerHTML = currentStep;
  }
}

// Check if required fields are filled
function checkRequiredFields(currentQuestion) {
  const requiredFields = currentQuestion.querySelectorAll('[required]');
  
  if (requiredFields.length === 0) {
    setNextButtonState(true, currentQuestion);
    return true;
  }
  
  setNextButtonState(false, currentQuestion);
  
  return Array.from(requiredFields).every(field => {
    if (field.type === 'checkbox') {
      return field.checked;
    } else if (field.type === 'radio') {
      const radioButtons = currentQuestion.querySelectorAll('input[type="radio"]');
      return Array.from(radioButtons).some(radio => radio.checked);
    } else if (field.type === 'email') {
      const email = field.value.toLowerCase();
      const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return emailPattern.test(email);
    } else {
      return field.value.trim() !== '';
    }
  });
}

// Set up custom styles for input elements
function setupCustomStyles() {
  // Add active class to radio buttons
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('click', () => {
      // Remove active class from all radios in the same group
      const name = radio.getAttribute('name');
      const group = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
      
      group.forEach(btn => {
        btn.parentElement.classList.remove('quiz-active');
      });
      
      // Add active class to clicked radio
      radio.parentElement.classList.add('quiz-active');
    });
  });
  
  // Add active class to checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('click', () => {
      if (checkbox.checked) {
        checkbox.parentElement.classList.add('quiz-active');
      } else {
        checkbox.parentElement.classList.remove('quiz-active');
      }
    });
  });
  
  // Add input validation listeners
  document.querySelectorAll('[data-quiz-step]').forEach(step => {
    step.addEventListener('input', () => {
      const allFieldsFilled = checkRequiredFields(step);
      setNextButtonState(allFieldsFilled, step);
    });
  });
}

// Enable/disable next button based on validation
function setNextButtonState(allFieldsFilled, currentQuestion) {
  const nextButton = currentQuestion.querySelector('[data-quiz-next]');
  const submitButton = currentQuestion.querySelector('[data-quiz-submit]');
  
  if (allFieldsFilled) {
    if (nextButton) {
      nextButton.style.opacity = '1';
      nextButton.classList.remove('disabled');
      filledState = true;
    }
    
    if (submitButton) {
      submitButton.style.opacity = '1';
      submitButton.classList.remove('disabled');
      submitButton.removeAttribute('disabled');
      filledState = true;
    }
  } else {
    if (nextButton) {
      nextButton.style.opacity = '0.6';
      nextButton.classList.add('disabled');
      filledState = false;
    }
    
    if (submitButton) {
      submitButton.style.opacity = '0.6';
      submitButton.classList.add('disabled');
      submitButton.setAttribute('disabled', '');
      filledState = false;
    }
  }
}

// Setup navigation buttons
function setupNavigationButtons() {
  // Next buttons
  const nextButtons = document.querySelectorAll('[data-quiz-next]');
  nextButtons.forEach(nextButton => {
    nextButton.addEventListener('click', () => {
      const quizForm = nextButton.closest('[data-quiz-form]');
      const currentQuestion = nextButton.closest('.current-question');
      
      if (!filledState) {
        showValidationErrors(currentQuestion);
        return;
      }
      
      // Check if there's a specified destination
      const destination = nextButton.getAttribute('data-quiz-destination');
      
      // Check if there's conditional logic
      const conditional = nextButton.getAttribute('data-quiz-conditional');
      
      if (destination) {
        // Direct navigation to specified step
        goToQuestion(destination, quizForm, currentQuestion);
      } else if (conditional) {
        // Conditional navigation based on selected radio
        const radioButtons = currentQuestion.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
          if (radio.checked) {
            const radioDestination = radio.getAttribute('data-quiz-destination');
            if (radioDestination) {
              goToQuestion(radioDestination, quizForm, currentQuestion);
            }
          }
        });
      } else {
        // Default navigation to next sequential step
        const currentStep = currentQuestion.getAttribute('data-quiz-step');
        const currentStepNumber = parseInt(currentStep.replace('step-', ''));
        const nextStepNumber = currentStepNumber + 1;
        const nextStep = 'step-' + nextStepNumber;
        
        const nextQuestionElement = quizForm.querySelector(`[data-quiz-step="${nextStep}"]`);
        if (nextQuestionElement) {
          goToQuestion(nextStep, quizForm, currentQuestion);
        } else {
          goToQuestion('final', quizForm, currentQuestion);
        }
      }
    });
  });
  
  // Previous buttons
  const prevButtons = document.querySelectorAll('[data-quiz-previous]');
  prevButtons.forEach(prevButton => {
    prevButton.addEventListener('click', () => {
      const quizForm = prevButton.closest('[data-quiz-form]');
      const currentQuestion = prevButton.closest('.current-question');
      
      // Get the previous step from session storage
      const stepFlow = sessionStorage.getItem('step-flow');
      if (stepFlow) {
        const steps = stepFlow.split(',');
        if (steps.length > 1) {
          const prevStep = steps[steps.length - 2];
          goToPreviousQuestion(prevStep, quizForm, currentQuestion);
          
          // Update step flow in session storage
          sessionStorage.setItem('step-flow', steps.slice(0, -1).join(','));
        }
      }
    });
  });
  
  // Submit buttons
  const submitButtons = document.querySelectorAll('[data-quiz-submit]');
  submitButtons.forEach(submitButton => {
    submitButton.addEventListener('click', () => {
      if (!filledState) {
        return;
      }
      
      const quizForm = submitButton.closest('[data-quiz-form]');
      const currentQuestion = submitButton.closest('.current-question');
      
      // Calculate final result
      calculateResult(quizForm);
      
      // Show final step
      goToQuestion('final', quizForm, currentQuestion);
      
      // Handle redirect if specified
      const redirectUrl = submitButton.getAttribute('data-quiz-redirect');
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
      }
    });
  });
  
  // Start over buttons
  const startOverButtons = document.querySelectorAll('[data-quiz-restart]');
  startOverButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Clear session storage
      sessionStorage.clear();
      weightResults = {
        resultA: 0,
        resultB: 0,
        resultC: 0
      };
      
      // Reload page
      window.location.reload();
    });
  });
}

// Navigate to a specific question
function goToQuestion(stepNumber, quizForm, currentQuestion) {
  if (!filledState) {
    showValidationErrors(currentQuestion);
    return;
  }
  
  // Save weights from current question
  saveWeights(currentQuestion);
  
  // Track navigation flow
  const existingFlow = sessionStorage.getItem('step-flow');
  if (existingFlow) {
    sessionStorage.setItem('step-flow', `${existingFlow},${stepNumber}`);
  } else {
    sessionStorage.setItem('step-flow', `step-1,${stepNumber}`);
  }
  
  // Hide current question
  currentQuestion.classList.remove('current-question');
  currentQuestion.style.display = 'none';
  
  if (stepNumber === 'final') {
    // Show result based on weights
    showResult(quizForm);
  } else {
    // Show next question
    const nextQuestion = quizForm.querySelector(`[data-quiz-step="${stepNumber}"]`);
    nextQuestion.classList.add('current-question');
    nextQuestion.style.display = 'block';
    
    // Check required fields in new question
    checkRequiredFields(nextQuestion);
    
    // Update question number
    updateQuestionNumber(nextQuestion, stepNumber);
  }
  
  // Update progress indicator
  updateProgress(stepNumber, quizForm);
}


  currentQuestion.style.display = 'none';
  
  // Show previous question
  const prevQuestion = quizForm.querySelector(`[quiz-attr="step="${stepNumber}"]`);
  prevQuestion.classList.add('current-question');
  prevQuestion.style.display = 'block';
  
  // Check required fields
  checkRequiredFields(prevQuestion);
  
  // Update question number
  updateQuestionNumber(prevQuestion, stepNumber);
  
  // Update progress indicator
  updateProgress(stepNumber, quizForm);
}

// Show validation errors
function showValidationErrors(currentQuestion) {
  const requiredFields = currentQuestion.querySelectorAll('[required]');
  
  requiredFields.forEach(field => {
    if (field.type === 'checkbox' && !field.checked) {
      field.classList.add('input-error');
    } else if (field.type === 'radio') {
      const name = field.getAttribute('name');
      const group = currentQuestion.querySelectorAll(`input[type="radio"][name="${name}"]`);
      const checked = Array.from(group).some(radio => radio.checked);
      
      if (!checked) {
        group.forEach(radio => {
          radio.classList.add('input-error');
        });
      }
    } else if (field.type === 'email') {
      const email = field.value.toLowerCase();
      const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      
      if (!emailPattern.test(email)) {
        field.classList.add('input-error');
      }
    } else if (field.value.trim() === '') {
      field.classList.add('input-error');
    }
  });
}

// Update question number display
function updateQuestionNumber(question, stepNumber) {
  if (stepNumber === 'final') return;
  
  const currentNumber = parseInt(stepNumber.replace('step-', ''));
  const questionNumberDisplay = question.querySelector('[data-quiz-current]');
  
  if (questionNumberDisplay) {
    questionNumberDisplay.innerHTML = currentNumber;
  }
}

// Save weights from answers
function saveWeights(currentQuestion) {
  const weightedInputs = currentQuestion.querySelectorAll('[data-quiz-weight]');
  
  weightedInputs.forEach(input => {
    if ((input.type === 'radio' || input.type === 'checkbox') && input.checked) {
      const weights = input.getAttribute('data-quiz-weight').split(',');
      
      weights.forEach(weightPair => {
        const [result, value] = weightPair.split(':');
        if (result && value) {
          weightResults[result] = (weightResults[result] || 0) + parseInt(value);
        }
      });
    }
  });
}

// Calculate final result
function calculateResult() {
  console.log('Calculating results:', weightResults);
  
  // Find the highest weight
  let highestWeight = 0;
  let highestResult = null;
  
  for (const result in weightResults) {
    if (weightResults[result] > highestWeight) {
      highestWeight = weightResults[result];
      highestResult = result;
    }
  }
  
  // Store the result
  sessionStorage.setItem('quiz-result', highestResult);
  return highestResult;
}

// Show the appropriate result screen
function showResult(quizForm) {
  const result = sessionStorage.getItem('quiz-result') || calculateResult();
  console.log('Showing result:', result);
  
  // Find the results container 
  const resultsContainer = quizForm.querySelector('[data-quiz-results]');
  if (!resultsContainer) return;
  
  // Show the results container
  resultsContainer.style.display = 'block';
  
  // Hide all individual result screens first
  const allResultScreens = resultsContainer.querySelectorAll('[data-quiz-result]');
  allResultScreens.forEach(screen => {
    screen.style.display = 'none';
  });
  
  // Show the matching result screen
  const resultScreen = resultsContainer.querySelector(`[data-quiz-result="${result}"]`);
  if (resultScreen) {
    resultScreen.style.display = 'block';
    
    // Check if there's a redirect URL in the result
    const redirectUrl = resultScreen.getAttribute('data-quiz-redirect');
    if (redirectUrl) {
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);
    }
  } else {
    // If no specific result screen, show default
    const defaultResult = resultsContainer.querySelector('[data-quiz-result="default"]');
    if (defaultResult) {
      defaultResult.style.display = 'block';
    }
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initQuiz);

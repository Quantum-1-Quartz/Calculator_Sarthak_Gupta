function check_my_stack(mystack) {
    if (mystack.length % 2 !== 0) {
        console.log("Error: Unbalanced parentheses");
        return false;
    }

    let stackCopy = [...mystack];
    while (stackCopy.length !== 0) {
        let toRemove = [];
        for (let j = 0; j < stackCopy.length - 1; j++) {
            if (stackCopy[j] === "(" && stackCopy[j + 1] === ")") {
                toRemove.push(j, j + 1);
                j++;
            }
        }

        if (toRemove.length === 0) return false;
        toRemove.reverse().forEach(index => stackCopy.splice(index, 1));
    }
    return true;
}

function evaluate(expression) {
    console.log(expression);
    const operators = ["/", "⨯", "+", "-"];
    let stack = [], indices = [];

    // Check for parentheses
    for (let j = 0; j < expression.length; j++) {
        if (expression[j] === "(" || expression[j] === ")") {
            stack.push(expression[j]);
            indices.push(j);
        }
    }

    // Evaluate sub-expressions inside parentheses
    if (stack.length !== 0) {
        if (!check_my_stack(stack)) {
            throw new Error("Unbalanced parentheses");
        }
        let left = indices[0], right = indices[indices.length - 1];
        let newTerm = evaluate(expression.slice(left + 1, right));
        return evaluate(expression.slice(0, left) + newTerm + expression.slice(right + 1));
    }

    // Evaluate based on operator precedence
    for (let op of operators) {
        let i = expression.lastIndexOf(op);
        if (i !== -1) {
            let left = expression.slice(0, i).trim();
            let right = expression.slice(i + 1).trim();
            let leftNum = parseFloat(left.split(/[-+⨯\/]/).pop());
            let rightNum = parseFloat(right.split(/[-+⨯\/]/)[0]);

            // Handle division by zero
            if (op === "/" && rightNum === 0) {
                throw new Error("Division by zero");
            }

            let result;
            switch (op) {
                case "/":
                    result = leftNum / rightNum;
                    break;
                case "⨯":
                    result = leftNum * rightNum;
                    break;
                case "+":
                    result = leftNum + rightNum;
                    break;
                case "-":
                    result = leftNum - rightNum;
                    break;
                default:
                    throw new Error("Invalid operator");
            }

            return evaluate(expression.replace(`${leftNum}${op}${rightNum}`, result));
        }
    }

    // Return the final result as a number
    return parseFloat(expression);
}

document.addEventListener("DOMContentLoaded", () => {
    const textarea = document.querySelector("#display_textarea");
    let lastOutput = ""; // Stores the last computed result

    const updateDisplay = (value) => {
        if (textarea.dataset.equal) {
            // If the last action was "=", clear the display for new input
            textarea.value = value;
            delete textarea.dataset.equal;
        } else {
            textarea.value += value;
        }
    };

    document.addEventListener("click", (event) => {
        const { target } = event;

        if (target.classList.contains("number")) {
            // If the last action was "=", replace the output with the new number
            if (textarea.dataset.equal) {
                textarea.value = target.innerHTML;
                delete textarea.dataset.equal;
            } else {
                updateDisplay(target.innerHTML);
            }
        } else if (target.classList.contains("operators")) {
            // If the last action was "=", keep the output as the first operand
            if (textarea.dataset.equal) {
                textarea.value = lastOutput + target.innerHTML;
                delete textarea.dataset.equal;
            } else {
                updateDisplay(target.innerHTML);
            }
        } else if (target.id === "equal") {
            try {
                let answer = evaluate(textarea.value);
                lastOutput = isNaN(answer) || !isFinite(answer) ? "" : (answer % 1 === 0 ? answer : answer.toFixed(2));
                textarea.value = lastOutput;
                textarea.dataset.equal = true;
            } catch (error) {
                console.error(error);
                textarea.value = "Error";
                textarea.style.color = "red";
                setTimeout(() => {
                    textarea.style.color = "";
                    textarea.value = "";
                }, 2000);
            }
        } else if (target.id === "DEL") {
            textarea.value = textarea.value.slice(0, -1);
        } else if (target.id === "AC") {
            textarea.value = "";
            textarea.placeholder = "0";
            lastOutput = "";
        } else if (target.id === ".") {
            // Handle decimal point input
            if (textarea.dataset.equal) {
                textarea.value = "0.";
                delete textarea.dataset.equal;
            } else if (!textarea.value.includes(".")) {
                updateDisplay(".");
            }
        }
    });
});

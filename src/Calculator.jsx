import { useState, useCallback } from "react";
import styles from "./Calculator.module.css";

const BUTTONS = [
  ["AC", "+/-", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

const getButtonType = (label) => {
  if (["÷", "×", "−", "+", "="].includes(label)) return "operator";
  if (["AC", "+/-", "%"].includes(label)) return "function";
  return "digit";
};

const formatNum = (n) => {
  const num = parseFloat(n);
  if (isNaN(num)) return "Error";
  if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0))
    return num.toExponential(4);
  return parseFloat(num.toFixed(10)).toString();
};

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [operator, setOperator] = useState(null);
  const [prevValue, setPrevValue] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [activeOp, setActiveOp] = useState(null);

  const calculate = useCallback((a, b, op) => {
    switch (op) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : NaN;
      default: return b;
    }
  }, []);

  const handleButton = useCallback(
    (label) => {
      if (label === "AC") {
        setDisplay("0");
        setExpression("");
        setOperator(null);
        setPrevValue(null);
        setWaitingForOperand(false);
        setActiveOp(null);
        return;
      }

      if (label === "+/-") {
        setDisplay((d) => formatNum(parseFloat(d) * -1));
        return;
      }

      if (label === "%") {
        setDisplay((d) => formatNum(parseFloat(d) / 100));
        return;
      }

      if (["+", "−", "×", "÷"].includes(label)) {
        const current = parseFloat(display);
        if (prevValue !== null && !waitingForOperand) {
          const result = calculate(prevValue, current, operator);
          const formatted = formatNum(result);
          setDisplay(formatted);
          setPrevValue(parseFloat(formatted));
          setExpression(`${formatNum(parseFloat(formatted))} ${label}`);
        } else {
          setPrevValue(current);
          setExpression(`${formatNum(current)} ${label}`);
        }
        setOperator(label);
        setActiveOp(label);
        setWaitingForOperand(true);
        return;
      }

      if (label === "=") {
        if (operator && prevValue !== null) {
          const current = parseFloat(display);
          const result = calculate(prevValue, current, operator);
          const formatted = formatNum(result);
          setExpression(`${expression} ${formatNum(current)} =`);
          setDisplay(formatted);
          setOperator(null);
          setPrevValue(null);
          setWaitingForOperand(false);
          setActiveOp(null);
        }
        return;
      }

      if (label === ".") {
        if (waitingForOperand) {
          setDisplay("0.");
          setWaitingForOperand(false);
          return;
        }
        if (!display.includes(".")) setDisplay((d) => d + ".");
        return;
      }

      if (waitingForOperand) {
        setDisplay(label);
        setWaitingForOperand(false);
      } else {
        setDisplay((d) => (d === "0" ? label : d.length < 12 ? d + label : d));
      }
      setActiveOp(null);
    },
    [display, operator, prevValue, waitingForOperand, expression, calculate]
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.calculator}>
        {/* Display */}
        <div className={styles.display}>
          <div className={styles.expression}>{expression || "\u00A0"}</div>
          <div className={styles.result}>{display}</div>
        </div>

        {/* Button Grid */}
        <div className={styles.grid}>
          {BUTTONS.flat().map((label, i) => {
            const type = getButtonType(label);
            const isWide = label === "0";
            const isActive = type === "operator" && activeOp === label;

            return (
              <button
                key={i}
                className={[
                  styles.btn,
                  styles[type],
                  isWide ? styles.wide : "",
                  isActive ? styles.active : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleButton(label)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Calculator;
import { useState, useCallback } from "react";

const BUTTONS = [
  ["AC", "+/-", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

const BTN_TYPE = (label) => {
  if (["÷", "×", "−", "+", "="].includes(label)) return "operator";
  if (["AC", "+/-", "%"].includes(label)) return "function";
  return "digit";
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "var(--color-background-tertiary)",
    fontFamily: "var(--font-sans)",
  },
  calc: {
    width: 320,
    background: "#1c1c1e",
    borderRadius: 32,
    overflow: "hidden",
    boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
  },
  display: {
    padding: "28px 24px 16px",
    textAlign: "right",
    minHeight: 120,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    gap: 4,
  },
  expression: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    minHeight: 18,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  result: {
    fontSize: 56,
    fontWeight: 300,
    color: "#fff",
    lineHeight: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    letterSpacing: -2,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 1,
    background: "#3a3a3c",
  },
  btn: (type, isWide, active) => ({
    gridColumn: isWide ? "span 2" : "span 1",
    padding: "0 0",
    height: 76,
    border: "none",
    borderRadius: 0,
    fontSize: 24,
    fontWeight: 400,
    cursor: "pointer",
    transition: "filter 0.1s",
    display: "flex",
    alignItems: "center",
    justifyContent: isWide ? "flex-start" : "center",
    paddingLeft: isWide ? 28 : 0,
    background:
      type === "operator"
        ? active
          ? "#fff"
          : "#ff9f0a"
        : type === "function"
        ? "#636366"
        : "#2c2c2e",
    color:
      type === "operator" ? (active ? "#ff9f0a" : "#fff") : "#fff",
    fontFamily: "var(--font-sans)",
  }),
};

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [operator, setOperator] = useState(null);
  const [prevValue, setPrevValue] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [activeOp, setActiveOp] = useState(null);

  const formatNum = (n) => {
    const num = parseFloat(n);
    if (isNaN(num)) return "Error";
    if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0))
      return num.toExponential(4);
    const str = parseFloat(num.toFixed(10)).toString();
    return str;
  };

  const calculate = useCallback((a, b, op) => {
    switch (op) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : NaN;
      default: return b;
    }
  }, []);

  const handleButton = useCallback((label) => {
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
  }, [display, operator, prevValue, waitingForOperand, expression, calculate]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.calc}>
        <div style={styles.display}>
          <div style={styles.expression}>{expression || " "}</div>
          <div style={styles.result}>{display}</div>
        </div>
        <div style={styles.grid}>
          {BUTTONS.flat().map((label, i) => {
            const isWide = label === "0";
            const type = BTN_TYPE(label);
            const active = type === "operator" && activeOp === label;
            return (
              <button
                key={i}
                style={styles.btn(type, isWide, active)}
                onClick={() => handleButton(label)}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                onMouseDown={(e) => (e.currentTarget.style.filter = "brightness(0.85)")}
                onMouseUp={(e) => (e.currentTarget.style.filter = "brightness(1.15)")}
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

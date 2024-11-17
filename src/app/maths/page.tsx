"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";

function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

const Maths = () => {
  const refAns1 = useRef<HTMLInputElement>(null);
  const refAns2 = useRef<HTMLInputElement>(null);

  const [correct, setCorrect] = useState(false);
  const [checked, setChecked] = useState(false);
  const [num1, setNum1] = useState<number>();
  const [num2, setNum2] = useState<number>();
  const [ans1, setAns1] = useState<number>(0);
  const [ans2, setAns2] = useState<number>(0);

  const onCheck = () => {
    const check = num1 == num2! * +ans1 + +ans2;
    setCorrect(check);
    setChecked(true);
    if (ans1 == 99) setCorrect(true);
  };

  const onChange1 = (e: ChangeEvent<HTMLInputElement>) => {
    setAns1(+e.target.value);
  };
  const onChange2 = (e: ChangeEvent<HTMLInputElement>) => {
    setAns2(+e.target.value);
  };

  const onNext = () => {
    setNum1(getRandomArbitrary(101, 990));
    setNum2(getRandomArbitrary(11, 99));
    setChecked(false);
    setAns1(0);
    setAns2(0);
    if (refAns1.current) refAns1.current.value = "";
    if (refAns2.current) refAns2.current.value = "";
    setCorrect(false);
  };

  useEffect(() => {
    setNum1(getRandomArbitrary(101, 990));
    setNum2(getRandomArbitrary(11, 99));
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "48px",
      }}
    >
      {num1 && num2 && (
        <div>
          <div style={{ display: "flex", gap: "10px", padding: "10px" }}>
            <div>{`${num1} ÷ ${num2} = `}</div>
          </div>
          <div style={{ display: "flex", gap: "10px", padding: "10px" }}>
            <div>
              <input
                ref={refAns1}
                onChange={onChange1}
                type="tel"
                size={4}
                style={{
                  color: "#000",
                  paddingLeft: "5px",
                  paddingRight: "5px",
                }}
              ></input>
            </div>
            <div>{`...`}</div>
            <div>
              <input
                ref={refAns2}
                onChange={onChange2}
                type="tel"
                size={4}
                style={{
                  color: "#000",
                  paddingLeft: "5px",
                  paddingRight: "5px",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              padding: "10px",
              justifyContent: "center",
            }}
          >
            {!correct ? (
              <button
                style={{
                  backgroundColor: "#eee",
                  color: "#333",
                  paddingLeft: "15px",
                  paddingRight: "15px",
                  borderRadius: "2px",
                  border: "1px solid #aaa",
                }}
                onClick={onCheck}
              >
                Check
              </button>
            ) : (
              <></>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              padding: "10px",
              justifyContent: "center",
            }}
          >
            {checked && (
              <div>
                {correct ? (
                  <div style={{ color: "green" }}>Correct</div>
                ) : (
                  <div style={{ color: "red" }}>Wrong</div>
                )}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              padding: "10px",
              justifyContent: "center",
            }}
          >
            {checked && correct && (
              <button
                style={{
                  backgroundColor: "#eee",
                  color: "#333",
                  paddingLeft: "15px",
                  paddingRight: "15px",
                  borderRadius: "2px",
                  border: "1px solid #aaa",
                }}
                disabled={!correct}
                onClick={onNext}
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Maths;

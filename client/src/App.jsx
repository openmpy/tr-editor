import html2canvas from "html2canvas";
import React, { useRef, useState } from "react";
import "./App.css";

function App() {
  const captureRef = useRef(null);
  const [bgImage, setBgImage] = useState(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const fileInputRef = useRef(null);
  const [bgPosX, setBgPosX] = useState("0");
  const [bgPosY, setBgPosY] = useState("0");
  const [bgSizeX, setBgSizeX] = useState("");
  const [bgSizeY, setBgSizeY] = useState("");

  // 위젯 관련 상태
  const [widgets, setWidgets] = useState([
    // 최대 5개, 초기값은 빈 객체
    { img: null, posX: "0", posY: "0", sizeX: "", sizeY: "" },
    { img: null, posX: "0", posY: "0", sizeX: "", sizeY: "" },
    { img: null, posX: "0", posY: "0", sizeX: "", sizeY: "" },
    { img: null, posX: "0", posY: "0", sizeX: "", sizeY: "" },
    { img: null, posX: "0", posY: "0", sizeX: "", sizeY: "" },
  ]);
  const widgetFileInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const [widgetOpenIdx, setWidgetOpenIdx] = useState(null); // 드롭다운 오픈 인덱스
  const [hideGreenBlocks, setHideGreenBlocks] = useState(false);

  const handleCapture = async () => {
    if (!captureRef.current) return;
    setHideGreenBlocks(true);
    await new Promise((resolve) => setTimeout(resolve, 50)); // 렌더 대기
    const canvas = await html2canvas(captureRef.current, {
      width: 900,
      height: 664,
      scale: 1,
      backgroundColor: null,
    });
    setHideGreenBlocks(false);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "capture.png";
    link.click();
  };

  const handleBgImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBgImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 숫자만 입력받는 핸들러
  const handleBgPosXChange = (e) => {
    const value = e.target.value.replace(/[^0-9-]/g, "");
    setBgPosX(value);
  };
  const handleBgPosYChange = (e) => {
    const value = e.target.value.replace(/[^0-9-]/g, "");
    setBgPosY(value);
  };

  // SX, SY 입력 핸들러 (숫자만)
  const handleBgSizeXChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setBgSizeX(value);
  };
  const handleBgSizeYChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setBgSizeY(value);
  };

  // 위젯 이미지 업로드 핸들러
  const handleWidgetImageChange = (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setWidgets((prev) => {
        const newWidgets = [...prev];
        newWidgets[idx].img = event.target.result;
        return newWidgets;
      });
    };
    reader.readAsDataURL(file);
  };
  // 위젯 위치/크기 핸들러
  const handleWidgetPosXChange = (idx, e) => {
    const value = e.target.value.replace(/[^0-9-]/g, "");
    setWidgets((prev) => {
      const newWidgets = [...prev];
      newWidgets[idx].posX = value;
      return newWidgets;
    });
  };
  const handleWidgetPosYChange = (idx, e) => {
    const value = e.target.value.replace(/[^0-9-]/g, "");
    setWidgets((prev) => {
      const newWidgets = [...prev];
      newWidgets[idx].posY = value;
      return newWidgets;
    });
  };
  const handleWidgetSizeXChange = (idx, e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setWidgets((prev) => {
      const newWidgets = [...prev];
      newWidgets[idx].sizeX = value;
      return newWidgets;
    });
  };
  const handleWidgetSizeYChange = (idx, e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setWidgets((prev) => {
      const newWidgets = [...prev];
      newWidgets[idx].sizeY = value;
      return newWidgets;
    });
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#f6f6f6] relative">
      {/* 헤더 */}
      <header className="w-full h-[56px] bg-[#22c55e] flex items-center px-32 text-white text-xl font-bold shadow-sm z-10 justify-between">
        <span>테일즈런너 광장 에디터</span>
        <a
          href="https://discord.gg/gejJjkvFpq"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#5865F2] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#4752c4] border border-[#5865F2] transition"
        >
          디스코드
        </a>
      </header>
      <div className="flex-1 flex justify-center items-center relative bg-[#f6f6f6]">
        {/* 배경 올리기 패널 - 캔버스 바로 왼쪽에 absolute로 띄움 (헤더 하단과 수직 정렬) */}
        <div className="absolute right-1/2 mr-[480px] top-[34px] flex flex-col items-end">
          <div className="bg-white border border-[#22c55e] p-6 min-w-[260px] flex flex-col gap-4">
            <div className="text-lg font-bold text-[#22c55e] mb-1">
              배경화면 올리기
            </div>
            <div className="text-xs text-gray-500 mb-2">
              배경화면을 업로드하고 위치/크기를 조절하세요.
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label
                className="text-xs font-semibold text-black"
                htmlFor="bg-color-picker"
              >
                배경색
              </label>
              <input
                id="bg-color-picker"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-7 h-7 p-0 border-none bg-transparent cursor-pointer"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleBgImageChange}
              className="hidden"
              ref={fileInputRef}
            />
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                className="flex items-center justify-center gap-2 bg-[#22c55e] text-white px-3 py-2 text-sm rounded-lg hover:bg-[#16a34a] transition"
              >
                배경화면 업로드
              </button>
              {bgImage && (
                <button
                  type="button"
                  onClick={() => setBgImage(null)}
                  className="flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 text-sm rounded-lg hover:bg-red-600 transition"
                >
                  배경화면 제거
                </button>
              )}
            </div>
            <hr className="my-2 border-[#e5e7eb]" />
            <div>
              <div className="text-xs font-semibold text-black mb-1">
                좌표 (px)
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <label className="block text-xs mb-0.5">X</label>
                  <input
                    type="text"
                    value={bgPosX}
                    onChange={handleBgPosXChange}
                    className="w-full text-xs px-2 py-1 rounded border border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#bbf7d0]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-0.5">Y</label>
                  <input
                    type="text"
                    value={bgPosY}
                    onChange={handleBgPosYChange}
                    className="w-full text-xs px-2 py-1 rounded border border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#bbf7d0]"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-black mb-1">
                사이즈 (px)
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <label className="block text-xs mb-0.5">SX</label>
                  <input
                    type="text"
                    value={bgSizeX}
                    onChange={handleBgSizeXChange}
                    className="w-full text-xs px-2 py-1 rounded border border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#bbf7d0]"
                    placeholder="auto"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-0.5">SY</label>
                  <input
                    type="text"
                    value={bgSizeY}
                    onChange={handleBgSizeYChange}
                    className="w-full text-xs px-2 py-1 rounded border border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#bbf7d0]"
                    placeholder="auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 캔버스 영역: 화면 정중앙 */}
        <div className="mx-auto">
          <div className="w-[902px] h-[702px] overflow-hidden border border-[#22c55e] bg-white flex flex-col">
            <div className="w-full h-[36px] bg-[#22c55e] flex items-center justify-end pr-4">
              <button
                onClick={handleCapture}
                className="bg-white text-[#222] px-2 py-0.5 text-sm rounded hover:bg-[#f0fdf4] border border-[#22c55e]"
              >
                저장하기
              </button>
            </div>
            <div
              className="w-full h-[calc(100%_-_36px)] flex flex-col overflow-hidden"
              ref={captureRef}
            >
              <div
                className="w-full h-full flex bg-[center_center] bg-no-repeat pt-[16px]"
                style={{
                  backgroundColor: bgColor,
                  backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                  backgroundSize: bgImage
                    ? bgSizeX !== "" || bgSizeY !== ""
                      ? `${bgSizeX !== "" ? bgSizeX + "px" : "auto"} ${
                          bgSizeY !== "" ? bgSizeY + "px" : "auto"
                        }`
                      : "auto"
                    : undefined,
                  backgroundPositionX: bgImage
                    ? `${
                        bgPosX === "" || bgPosX === "-" ? 0 : Number(bgPosX)
                      }px`
                    : undefined,
                  backgroundPositionY: bgImage
                    ? `${
                        bgPosY === "" || bgPosY === "-" ? 0 : Number(bgPosY)
                      }px`
                    : undefined,
                  position: "relative", // 위젯 이미지 절대좌표 기준
                  width: "900px",
                  height: "664px",
                  overflow: "hidden", // 캔버스 내부만 보이게
                }}
              >
                {/* 위젯 렌더링 (z-index: 1) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                    pointerEvents: "none",
                  }}
                >
                  {widgets.map((widget, idx) =>
                    widget.img ? (
                      <img
                        key={idx}
                        src={widget.img}
                        alt={`widget-${idx}`}
                        style={{
                          position: "absolute",
                          left:
                            widget.posX === "" || widget.posX === "-"
                              ? 0
                              : Math.min(
                                  Number(widget.posX),
                                  900 -
                                    (widget.sizeX ? Number(widget.sizeX) : 0)
                                ),
                          top:
                            widget.posY === "" || widget.posY === "-"
                              ? 0
                              : Math.min(
                                  Number(widget.posY),
                                  664 -
                                    (widget.sizeY ? Number(widget.sizeY) : 0)
                                ),
                          width:
                            widget.sizeX !== ""
                              ? Math.min(Number(widget.sizeX), 900) + "px"
                              : "auto",
                          height:
                            widget.sizeY !== ""
                              ? Math.min(Number(widget.sizeY), 664) + "px"
                              : "auto",
                          pointerEvents: "none",
                          maxWidth: "900px",
                          maxHeight: "664px",
                        }}
                      />
                    ) : null
                  )}
                </div>
                <div
                  className="mx-auto flex gap-[7px]"
                  style={{ position: "relative", zIndex: 2 }}
                >
                  {/* 왼쪽 영역 */}
                  <div
                    className={`w-[241px] flex flex-col gap-[8px] ${
                      hideGreenBlocks ? "hidden" : ""
                    }`}
                  >
                    <div className="w-full rounded-lg bg-[#22c55e] h-[236px]"></div>
                    <div className="w-full rounded-lg bg-[#22c55e] h-[123px]"></div>
                  </div>

                  {/* 오른쪽 영역 */}
                  <div
                    className={`flex flex-col w-[480px] max-h-[636px] ${
                      hideGreenBlocks ? "hidden" : ""
                    }`}
                  >
                    <div className="w-full bg-[#22c55e] mb-2 rounded-lg h-[46px]"></div>
                    <div className="w-full bg-[#22c55e] rounded-lg h-[calc(100%_-_54px)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 위젯 패널 - 캔버스 바로 오른쪽에 absolute로 띄움 (헤더 하단과 수직 정렬) */}
        <div className="absolute left-1/2 ml-[480px] top-[34px] flex flex-col items-start">
          <div className="bg-white border border-[#22c55e] p-6 min-w-[260px] flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            <div className="text-lg font-bold text-[#22c55e] mb-1">
              이미지 추가
            </div>
            <div className="text-xs text-gray-500 mb-2">
              이미지를 올리고 위치/크기를 조절하세요.
            </div>
            {widgets.map((widget, idx) => (
              <div
                key={idx}
                className="mb-2 border-b border-[#e5e7eb] pb-2 last:border-b-0 last:pb-0"
              >
                <button
                  type="button"
                  onClick={() =>
                    setWidgetOpenIdx(widgetOpenIdx === idx ? null : idx)
                  }
                  className={`w-full flex items-center justify-between px-2 py-2 rounded bg-[#f0fdf4] border border-[#bbf7d0] text-xs font-semibold mb-1 ${
                    widgetOpenIdx === idx ? "text-[#16a34a]" : "text-[#22c55e]"
                  }`}
                >
                  <span>
                    {widget.img
                      ? `이미지${idx + 1} (이미지 있음)`
                      : `이미지${idx + 1}`}
                  </span>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform ${
                      widgetOpenIdx === idx ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {widgetOpenIdx === idx && (
                  <div className="pt-2 flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleWidgetImageChange(idx, e)}
                      className="hidden"
                      ref={widgetFileInputRefs[idx]}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        widgetFileInputRefs[idx].current &&
                        widgetFileInputRefs[idx].current.click()
                      }
                      className="flex items-center justify-center gap-2 bg-[#22c55e] text-white px-3 py-2 text-sm rounded-lg hover:bg-[#16a34a] transition"
                    >
                      {widget.img ? "이미지 변경" : `이미지${idx + 1} 업로드`}
                    </button>
                    {widget.img && (
                      <button
                        type="button"
                        onClick={() => {
                          setWidgets((prev) => {
                            const newWidgets = [...prev];
                            newWidgets[idx].img = null;
                            return newWidgets;
                          });
                        }}
                        className="flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 text-sm rounded-lg hover:bg-red-600 transition mb-2"
                      >
                        이미지 제거
                      </button>
                    )}
                    <div className="text-xs font-semibold text-black mb-1 mt-2">
                      좌표 (px)
                    </div>
                    <div>
                      <label className="block text-xs mb-0.5">X</label>
                      <input
                        type="text"
                        value={widget.posX}
                        onChange={(e) => handleWidgetPosXChange(idx, e)}
                        className="w-full text-xs px-2 py-1 rounded border border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#bbf7d0]"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-0.5">Y</label>
                      <input
                        type="text"
                        value={widget.posY}
                        onChange={(e) => handleWidgetPosYChange(idx, e)}
                        className="w-full text-xs px-2 py-1 rounded border border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#bbf7d0]"
                        placeholder="0"
                      />
                    </div>
                    <div className="text-xs font-semibold text-black mb-1 mt-2">
                      사이즈 (px)
                    </div>
                    <div>
                      <label className="block text-xs mb-0.5">SX</label>
                      <input
                        type="text"
                        value={widget.sizeX}
                        onChange={(e) => handleWidgetSizeXChange(idx, e)}
                        className="w-full text-xs px-2 py-1 rounded border border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#bbf7d0]"
                        placeholder="auto"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-0.5">SY</label>
                      <input
                        type="text"
                        value={widget.sizeY}
                        onChange={(e) => handleWidgetSizeYChange(idx, e)}
                        className="w-full text-xs px-2 py-1 rounded border border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#bbf7d0]"
                        placeholder="auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 푸터 */}
      <footer className="w-full h-[44px] bg-white flex items-center justify-center text-xs text-[#888] font-medium z-10 border-t border-[#e5e7eb]">
        © 2025 레디스. All rights reserved.
      </footer>
    </div>
  );
}

export default App;

import gifshot from "gifshot";
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

  // gifshot 관련 상태
  const [mp4File, setMp4File] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  // 모달 상태
  const [showGifModal, setShowGifModal] = useState(false);

  // 파일 input ref (모달용)
  const videoInputRef = useRef(null);

  // 프레임 수 상태
  const [numFrames, setNumFrames] = useState(20);
  // 프레임 간 시간 상태
  const [frameDuration, setFrameDuration] = useState(1);

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

  // mp4 파일 업로드 핸들러
  const handleMp4Change = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMp4File(file);
    setGifUrl(null);
  };

  // 프레임 입력 핸들러
  const handleNumFramesChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setNumFrames(value === "" ? "" : Math.max(1, Number(value)));
  };

  // 프레임 간 시간 입력 핸들러
  const handleFrameDurationChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setFrameDuration(value === "" ? "" : Math.max(1, Number(value)));
  };

  // mp4 → gif 변환 핸들러
  const handleConvertToGif = () => {
    if (!mp4File) return;
    setIsConverting(true);
    const fileUrl = URL.createObjectURL(mp4File);
    const video = document.createElement("video");
    video.src = fileUrl;
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      gifshot.createGIF(
        {
          video: [fileUrl],
          gifWidth: width,
          gifHeight: height,
          numFrames: Number(numFrames) || 20,
          frameDuration: Math.round(Number(frameDuration) / 10) || 1,
          progressCallback: () => {},
        },
        function (obj) {
          setIsConverting(false);
          if (!obj.error) {
            setGifUrl(obj.image);
          } else {
            alert("GIF 변환에 실패했습니다.");
          }
          URL.revokeObjectURL(fileUrl);
        }
      );
    };
  };

  // gif 저장 핸들러
  const handleSaveGif = () => {
    if (!gifUrl) return;
    const link = document.createElement("a");
    link.href = gifUrl;
    link.download = "converted.gif";
    link.click();
  };

  // 파일명 표시용
  const getFileName = () => (mp4File ? mp4File.name : "선택된 파일 없음");

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f6f6f6] relative overflow-x-hidden">
      {/* 헤더 */}
      <header className="w-full min-w-0 h-[56px] bg-[#22c55e] flex items-center px-2 sm:px-4 md:px-12 lg:px-32 text-white text-lg md:text-xl font-bold shadow-sm z-10 justify-between mb-4">
        <span>테일즈런너 광장 에디터</span>
        <div className="flex items-center">
          <a
            href="https://forms.gle/ET1AwmYa8vTR5oGg6"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#6b7280] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#374151] border border-[#6b7280] transition mr-2"
          >
            건의하기
          </a>
          <a
            href="https://forms.gle/Q8V3fCxjYyYYS66M8"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ef4444] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#dc2626] border border-[#ef4444] transition mr-2"
          >
            버그제보
          </a>
          <a
            href="https://discord.gg/gejJjkvFpq"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#5865F2] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#4752c4] border border-[#5865F2] transition"
          >
            디스코드
          </a>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center relative bg-[#f6f6f6] px-2 w-full min-w-0 my-4">
        <div className="flex flex-col lg:flex-row items-start justify-center w-full max-w-[98vw] sm:max-w-[95vw] md:max-w-[900px] lg:max-w-[1100px] xl:max-w-[1400px] mx-auto gap-4">
          {/* 배경 올리기 패널 - 왼쪽 */}
          <div className="order-2 lg:order-1 w-full lg:w-auto flex-shrink-0 lg:static relative z-20 mb-4 lg:mb-0">
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
          {/* 캔버스 영역: 중앙 */}
          <div className="order-1 lg:order-2 w-full max-w-[98vw] sm:max-w-[95vw] md:max-w-[900px] lg:max-w-[902px] mx-auto flex-shrink-0">
            <div className="w-full h-[702px] overflow-hidden border border-[#22c55e] bg-white flex flex-col">
              <div className="w-full h-[36px] bg-[#22c55e] flex items-center justify-end pr-4 gap-2">
                <button
                  onClick={() => setHideGreenBlocks((prev) => !prev)}
                  className="bg-white text-[#222] px-2 py-0.5 text-sm rounded hover:bg-[#f0fdf4] border border-[#22c55e]"
                >
                  {hideGreenBlocks ? "블록 ON" : "블록 OFF"}
                </button>
                <button
                  onClick={() => setShowGifModal(true)}
                  className="bg-white text-[#222] px-2 py-0.5 text-sm rounded hover:bg-[#f0fdf4] border border-[#22c55e]"
                >
                  동영상 → GIF 변환
                </button>
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
          {/* 위젯 패널 - 오른쪽 */}
          <div className="order-3 w-full lg:w-auto flex-shrink-0 lg:static relative z-20">
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
                      widgetOpenIdx === idx
                        ? "text-[#16a34a]"
                        : "text-[#22c55e]"
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
      </div>
      {/* 푸터 */}
      <footer className="w-full min-w-0 h-[44px] bg-white flex items-center justify-center text-xs text-[#888] font-medium z-10 border-t border-[#e5e7eb] mt-4">
        © 2025 레디스. All rights reserved.
      </footer>
      {/* --- 동영상 → GIF 변환 모달 --- */}
      {showGifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white border border-[#22c55e] rounded-lg p-8 min-w-[320px] max-w-[90vw] flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-[#22c55e] text-xl font-bold hover:text-red-500"
              onClick={() => setShowGifModal(false)}
            >
              ×
            </button>
            <div className="text-lg font-bold text-[#22c55e] mb-1">
              동영상 → GIF
            </div>
            <div className="bg-[#f6fdf9] border border-[#bbf7d0] rounded-lg px-5 py-4 mb-4 text-sm text-gray-800">
              <div className="font-bold text-[#16a34a] text-base mb-2">
                안내문
              </div>
              <div className="space-y-1">
                <div>
                  <b>프레임 수</b>: GIF로 만들 프레임 개수입니다. 값이 클수록
                  부드럽지만 용량이 커집니다.
                </div>
                <div>
                  <b>프레임 간 시간(ms)</b>: 한 프레임이 표시되는
                  시간(밀리초)입니다. 값이 클수록 느리게 재생됩니다.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input
                id="video-upload"
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={handleMp4Change}
                className="hidden"
                ref={videoInputRef}
              />
              <button
                type="button"
                onClick={() =>
                  videoInputRef.current && videoInputRef.current.click()
                }
                className="bg-[#22c55e] text-white px-2 py-1 text-xs rounded hover:bg-[#16a34a] transition"
              >
                파일 선택
              </button>
              <span className="text-xs text-gray-700 truncate flex-1">
                {getFileName()}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label
                htmlFor="num-frames"
                className="text-xs font-semibold text-black"
              >
                프레임 수
              </label>
              <input
                id="num-frames"
                type="text"
                value={numFrames}
                onChange={handleNumFramesChange}
                className="w-16 text-xs px-2 py-1 rounded border border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#bbf7d0]"
                min={1}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label
                htmlFor="frame-duration"
                className="text-xs font-semibold text-black"
              >
                프레임 간 시간(ms)
              </label>
              <input
                id="frame-duration"
                type="text"
                value={frameDuration}
                onChange={handleFrameDurationChange}
                className="w-20 text-xs px-2 py-1 rounded border border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#bbf7d0]"
                min={1}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <button
              type="button"
              onClick={handleConvertToGif}
              disabled={!mp4File || isConverting}
              className="flex items-center justify-center gap-2 bg-[#22c55e] text-white px-3 py-2 text-sm rounded-lg hover:bg-[#16a34a] transition disabled:opacity-50 disabled:cursor-not-allowed mb-2"
            >
              {isConverting ? "변환 중..." : "GIF로 변환"}
            </button>
            {gifUrl && (
              <div className="flex flex-col items-center gap-2 mt-2 w-full">
                <img
                  src={gifUrl}
                  alt="gif 미리보기"
                  className="border rounded object-contain w-auto max-w-full max-h-48 mx-auto"
                  id="gif-preview-img"
                />
                {/* 이미지 정보 표시 */}
                <GifInfo gifUrl={gifUrl} />
                <button
                  type="button"
                  onClick={handleSaveGif}
                  className="bg-[#22c55e] text-white px-3 py-1 rounded hover:bg-[#16a34a] text-xs mt-2"
                >
                  GIF 저장
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// GIF 정보 컴포넌트
function GifInfo({ gifUrl }) {
  const [info, setInfo] = React.useState({
    width: null,
    height: null,
    size: null,
  });

  React.useEffect(() => {
    if (!gifUrl) return;
    // 이미지 크기
    const img = new window.Image();
    img.onload = function () {
      // 파일 용량 계산
      fetch(gifUrl)
        .then((res) => res.blob())
        .then((blob) => {
          setInfo({
            width: img.width,
            height: img.height,
            size: (blob.size / 1024).toFixed(1), // KB 단위
          });
        });
    };
    img.src = gifUrl;
  }, [gifUrl]);

  if (!info.width || !info.height || !info.size) return null;
  // MB 단위로 변환 (소수점 2자리)
  const sizeMB = (info.size / 1024).toFixed(2);
  return (
    <div className="text-xs text-gray-700 mt-1">
      크기:{" "}
      <b>
        {info.width} x {info.height}
      </b>{" "}
      px &nbsp; | &nbsp; 용량: <b>{sizeMB}</b> MB
    </div>
  );
}

export default App;

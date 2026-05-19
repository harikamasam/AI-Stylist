import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Bookmark,
  Bot,
  Camera,
  Check,
  Link,
  Play,
  Save,
  ScanLine,
  Shirt,
  Sparkles,
} from "lucide-react";
import ProductTabs from "../components/ProductTabs";
import StyleSelector from "../components/StyleSelector";
import RecommendationPanel from "../components/RecommendationPanel";
import TrackingPanel from "../components/TrackingPanel";
import VoiceAssistant from "../components/VoiceAssistant";
import AIChatButton from "../components/AIChatButton";
import AIChatPanel from "../components/AIChatPanel";
import ProductPreview from "../components/ProductPreview";
import BeforeAfter from "../components/BeforeAfter";
import AIAnalytics from "../components/AIAnalytics";
import OutfitInsights from "../components/OutfitInsights";
import LoginModal from "../components/LoginModal";
import SavedOutfitsPanel from "../components/SavedOutfitsPanel";
import UserMenu from "../components/UserMenu";
import { useAuth } from "../context/AuthContext";
import { useRecommendations } from "../hooks/useRecommendations";
import { CATEGORIES, STYLES } from "../utils/catalog";

function Dashboard() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const workspaceRef = useRef(null);

  const [category, setCategory] = useState("Shirts");
  const [style, setStyle] = useState("Casual");
  const [listening, setListening] = useState(false);
  const [loadingText, setLoadingText] = useState("AI READY");
  const [cameraUnavailable, setCameraUnavailable] = useState(true);
  const [productUrl, setProductUrl] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("try-on");
  const [toast, setToast] = useState("");
  const { saveOutfit, user } = useAuth();

  const {
    products,
    loading: recommendationsLoading,
    error: recommendationsError,
  } = useRecommendations(category, style);
  const detectedPose = cameraUnavailable ? "unknown" : "upright";

  useEffect(() => {
    let cancelled = false;
    let activeStream;

    const enableCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera not supported");
        }

        if (navigator.permissions?.query) {
          const permission = await navigator.permissions.query({
            name: "camera",
          });

          if (permission.state === "denied") {
            throw new Error("Camera permission denied");
          }
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        activeStream = stream;

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setCameraUnavailable(false);
      } catch {
        if (!cancelled) {
          setCameraUnavailable(true);
          setLoadingText("Camera permission needed");
        }
      }
    };

    enableCamera();

    return () => {
      cancelled = true;
      activeStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const texts = [
      "Analyzing Pose...",
      "Tracking Body...",
      "Detecting Fashion...",
      "Generating AI Try-On...",
    ];

    let index = 0;
    const interval = setInterval(() => {
      setLoadingText(texts[index]);
      index = (index + 1) % texts.length;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const startVoiceAssistant = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      window.alert("Voice not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.start();
    setListening(true);

    recognition.onresult = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  }, []);

  const scrollToWorkspace = useCallback(() => {
    workspaceRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleCategoryChange = useCallback(
    (nextCategory) => {
      setCategory(nextCategory);
    },
    []
  );

  const openTab = useCallback(
    (tab) => {
      setWorkspaceOpen(true);
      setActiveTab(tab);
      window.setTimeout(scrollToWorkspace, 80);
    },
    [scrollToWorkspace]
  );

  const startWorkspace = useCallback(
    (tab = "try-on") => {
      setWorkspaceOpen(true);
      setActiveTab(tab);
      window.setTimeout(scrollToWorkspace, 80);
    },
    [scrollToWorkspace]
  );

  const sidebarItems = [
    ["try-on", "Try-On", Camera],
    ["recommendations", "Recommendations", Shirt],
    ["analytics", "Analytics", BarChart3],
    ["wardrobe", "Wardrobe", Bookmark],
    ["assistant", "Assistant", Bot],
  ];

  const stylingSteps = [
    ["Select Category", category, Shirt],
    ["Paste Product URL", productUrl ? "Product linked" : "Waiting for URL", Link],
    ["Start AI Mirror", cameraUnavailable ? "Camera paused" : "Mirror live", ScanLine],
    ["Get Style Verdict", `${style} analysis ready`, Sparkles],
    ["Save Outfit", user ? "Wardrobe enabled" : "Sign in to save", Save],
  ];

  const activeStep = productUrl
    ? cameraUnavailable
      ? 1
      : 3
    : 0;

  const handleSaveOutfit = useCallback(
    (item) => {
      if (!user) {
        setLoginOpen(true);
        return;
      }

      saveOutfit({
        ...item,
        category,
        style,
      });
      setToast("Outfit saved to your wardrobe");
      window.setTimeout(() => setToast(""), 2400);
    },
    [category, saveOutfit, style, user]
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_18%_8%,rgba(214,194,161,0.16),transparent_26%),linear-gradient(135deg,#070706_0%,#11100e_48%,#050505_100%)] text-stone-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-10">
        <section className="editorial-fade relative min-h-[calc(100vh-3rem)] overflow-hidden rounded-[36px] border border-stone-200/10 bg-[linear-gradient(145deg,rgba(245,241,232,0.08),rgba(255,255,255,0.018))] p-5 shadow-2xl shadow-black/30 sm:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-stone-200/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-cyan-100/5 blur-3xl" />
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setWorkspaceOpen(false)}
              className="flex items-center gap-3 text-lg font-black tracking-tight text-stone-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-100 text-black shadow-lg shadow-stone-100/10">
                S
              </span>
              AI Stylist
            </button>
            <UserMenu onLogin={() => setLoginOpen(true)} />
          </div>

          <div className="grid min-h-[calc(100vh-11rem)] items-center gap-10 py-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.34em] text-stone-300">
                Your AI Fashion Intelligence System
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight text-stone-50 sm:text-6xl lg:text-7xl">
                See your style before you buy.
              </h1>
              <p className="mt-6 max-w-xl text-base font-medium leading-7 text-stone-300 sm:text-lg">
                Paste a fashion product, launch the AI mirror, and let Aura
                Stylist turn it into a scored, savable outfit story.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#workspace"
                  onClick={() => startWorkspace("try-on")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-100 px-6 py-3 text-sm font-black text-black shadow-xl shadow-stone-100/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#e6d8c3]"
                >
                  <Play size={16} />
                  Start Styling
                </a>
                <a
                  href="#workspace"
                  onClick={() => startWorkspace("recommendations")}
                  className="inline-flex items-center justify-center rounded-full border border-stone-200/15 px-6 py-3 text-sm font-black text-stone-100 transition duration-300 hover:-translate-y-0.5 hover:border-stone-100/40 hover:bg-stone-100/5"
                >
                  View Demo
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {["Live AI mirror", "Smart outfit scores", "Saved wardrobe"].map(
                  (pill) => (
                    <span
                      key={pill}
                      className="rounded-full border border-stone-200/10 bg-stone-100/[0.045] px-4 py-2 text-xs font-bold text-stone-300"
                    >
                      {pill}
                    </span>
                  )
                )}
              </div>

              <div className="mt-8 grid max-w-2xl gap-2 sm:grid-cols-4">
                {[
                  ["Paste product", "URL or shopping link"],
                  ["Analyze fit", "Body + style signal"],
                  ["Score outfit", "Recommendations"],
                  ["Save look", "Private wardrobe"],
                ].map(([title, text], index) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-stone-200/10 bg-stone-100/[0.035] p-3 transition duration-300 hover:-translate-y-0.5 hover:bg-stone-100/[0.055]"
                  >
                    <p className="text-xs font-black text-[#d6c2a1]">
                      0{index + 1}
                    </p>
                    <p className="mt-2 text-sm font-black text-stone-50">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-400">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-[32px] border border-stone-200/10 bg-black/35 p-3 shadow-2xl shadow-black/40">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#d6c2a1]/15 blur-3xl" />
              <div className="rounded-[26px] border border-stone-200/10 bg-[#11100e]/85 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d6c2a1]">
                      Product Preview
                    </p>
                    <h2 className="mt-2 text-2xl font-black">AI Try-On Studio</h2>
                  </div>
                  <Sparkles className="text-[#d6c2a1]" size={24} />
                </div>

                <div className="mt-5 overflow-hidden rounded-3xl border border-stone-200/10 bg-zinc-900 shadow-2xl shadow-black/40">
                  <img
                    src={products[0]?.image}
                    alt="AI Stylist product preview"
                    className="h-[260px] w-full object-cover transition duration-700 hover:scale-[1.03] sm:h-[340px]"
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black text-stone-300">
                  <div className="rounded-2xl bg-stone-100/[0.045] p-3">
                    {category}
                  </div>
                  <div className="rounded-2xl bg-stone-100/[0.045] p-3">
                    {style}
                  </div>
                  <div className="rounded-2xl bg-[#e6d8c3] p-3 text-black">
                    Live
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-stone-200/10 bg-stone-100/[0.035] p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-stone-400">
                        AI verdict preview
                      </p>
                      <p className="mt-1 font-black text-stone-50">
                        {products[0]?.title || "Styled product"}
                      </p>
                    </div>
                    <div className="rounded-full bg-[#e6d8c3] px-3 py-2 text-xs font-black text-black">
                      {products[0]?.match || "92%"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="workspace"
          ref={workspaceRef}
          className="editorial-fade scroll-mt-6 rounded-[32px] border border-stone-200/10 bg-[#0d0c0b] p-3 shadow-2xl shadow-black/30 sm:p-4"
        >
          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="hidden rounded-[28px] border border-stone-200/10 bg-stone-100/[0.025] p-3 lg:block">
              <p className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#d6c2a1]">
                Workspace
              </p>
              <div className="mt-2 space-y-1">
                {sidebarItems.map(([id, label, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-black transition ${
                      activeTab === id
                        ? "bg-stone-100 text-black"
                        : "text-stone-300 hover:bg-stone-100/[0.06] hover:text-white"
                    }`}
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                ))}
              </div>
            </aside>

            <div className="min-w-0">
              <div className="mb-4 flex overflow-x-auto rounded-full border border-stone-200/10 bg-black/40 p-1 text-xs font-black text-stone-300 lg:hidden">
                {sidebarItems.map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 transition ${
                    activeTab === id
                      ? "bg-stone-100 text-black"
                      : "hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
              </div>

              <div className="transition duration-300 ease-out">
                {activeTab === "try-on" && (
                  <div>
                    <section className="mb-4 rounded-[24px] border border-stone-200/10 bg-stone-100/[0.025] p-3">
                      <div className="grid gap-2 md:grid-cols-5">
                        {stylingSteps.map(([label, value, Icon], index) => (
                          <div
                            key={label}
                            className={`rounded-2xl border p-3 transition ${
                              index <= activeStep
                                ? "border-[#d6c2a1]/35 bg-[#d6c2a1]/10"
                                : "border-stone-200/10 bg-black/20"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <Icon
                                size={16}
                                className={
                                  index <= activeStep
                                    ? "text-[#d6c2a1]"
                                    : "text-gray-500"
                                }
                              />
                              {index < activeStep && (
                                <Check size={15} className="text-[#d6c2a1]" />
                              )}
                            </div>
                            <p className="mt-3 text-xs font-black text-white">
                              {label}
                            </p>
                            <p className="mt-1 text-[11px] font-semibold text-gray-400">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <div className="mb-4 rounded-[24px] border border-stone-200/10 bg-black/25 p-3">
                      <ProductTabs
                        categories={CATEGORIES}
                        category={category}
                        setCategory={handleCategoryChange}
                      />
                      <StyleSelector
                        styles={STYLES}
                        style={style}
                        setStyle={setStyle}
                      />
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(300px,0.82fr)]">
                      <TrackingPanel
                        videoRef={videoRef}
                        canvasRef={canvasRef}
                        loadingText={loadingText}
                        cameraUnavailable={cameraUnavailable}
                        category={category}
                        compact
                      />
                      <ProductPreview
                        productUrl={productUrl}
                        setProductUrl={setProductUrl}
                        onSave={() =>
                          handleSaveOutfit({
                            title: "AI Preview Look",
                            match: "Preview",
                            tag: "Try-On",
                            image:
                              products[0]?.image ||
                              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {activeTab === "recommendations" && (
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-stone-200/10 bg-black/25 p-3">
                      <ProductTabs
                        categories={CATEGORIES}
                        category={category}
                        setCategory={handleCategoryChange}
                      />
                      <StyleSelector
                        styles={STYLES}
                        style={style}
                        setStyle={setStyle}
                      />
                    </div>

                    <RecommendationPanel
                      products={products}
                      style={style}
                      loading={recommendationsLoading}
                      error={recommendationsError}
                      onSaveOutfit={handleSaveOutfit}
                      onFavoriteRecommendation={handleSaveOutfit}
                    />
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <AIAnalytics category={category} style={style} compact />
                    <OutfitInsights
                      category={category}
                      style={style}
                      pose={detectedPose}
                    />
                    <div className="xl:col-span-2">
                      <BeforeAfter />
                    </div>
                  </div>
                )}

                {activeTab === "wardrobe" && (
                  <SavedOutfitsPanel onLogin={() => setLoginOpen(true)} />
                )}

                {activeTab === "assistant" && (
                  <AIChatPanel
                    embedded
                    open
                    onClose={() => {}}
                    category={category}
                    style={style}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {workspaceOpen && (
        <nav className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-5 rounded-3xl border border-stone-200/10 bg-black/80 p-1 text-[10px] font-black text-stone-300 shadow-2xl shadow-black/50 backdrop-blur lg:hidden">
          {sidebarItems.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => openTab(id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition ${
                activeTab === id ? "bg-stone-100 text-black" : "hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        )}
      </div>

      <div className="fixed bottom-5 right-5 z-20 flex flex-col gap-3 sm:bottom-8 sm:right-8 sm:gap-4">
        <VoiceAssistant
          startVoiceAssistant={startVoiceAssistant}
          listening={listening}
        />

        <AIChatButton openAIChat={() => startWorkspace("assistant")} />
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      {toast && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full border border-stone-200/15 bg-zinc-950/95 px-5 py-3 text-sm font-black text-stone-100 shadow-2xl shadow-black/40 backdrop-blur">
          {toast}
        </div>
      )}
    </main>
  );
}

export default Dashboard;

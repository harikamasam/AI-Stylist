import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Bookmark,
  Bot,
  Camera,
  MessageCircle,
  Mic,
  Shirt,
} from "lucide-react";
import ProductTabs from "../components/ProductTabs";
import StyleSelector from "../components/StyleSelector";
import RecommendationPanel from "../components/RecommendationPanel";
import TrackingPanel from "../components/TrackingPanel";
import VoiceAssistant from "../components/VoiceAssistant";
import AIChatPanel from "../components/AIChatPanel";
import ProductPreview from "../components/ProductPreview";
import BeforeAfter from "../components/BeforeAfter";
import AIAnalytics from "../components/AIAnalytics";
import OutfitInsights from "../components/OutfitInsights";
import LoginModal from "../components/LoginModal";
import SavedOutfitsPanel from "../components/SavedOutfitsPanel";
import UserMenu from "../components/UserMenu";
import LandingPage from "../components/landing/LandingPage";
import { useAuth } from "../context/AuthContext";
import { useRecommendations } from "../hooks/useRecommendations";
import { CATEGORIES, STYLES } from "../utils/catalog";

const NAV_ITEMS = [
  ["try-on", "Try-On", Camera, "primary"],
  ["assistant", "Aura Assistant", Bot, "primary"],
  ["recommendations", "Recommendations", Shirt, "secondary"],
  ["analytics", "Analytics", BarChart3, "secondary"],
  ["wardrobe", "Wardrobe", Bookmark, "secondary"],
];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=90";

function Dashboard() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const tryOnTimersRef = useRef([]);

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
  const [tryOnState, setTryOnState] = useState("idle");
  const [tryOnMetrics, setTryOnMetrics] = useState({
    confidence: 0,
    shoulderFit: 0,
    torsoCoverage: 0,
    alignmentConfidence: 0,
    fitConfidence: 0,
    shoulder: "--",
    torso: "--",
    chest: "--",
    alignment: "pending",
    alignmentVerdict: "Waiting",
    bodyScale: "--",
    overlaySmoothing: "0%",
    landmarksDetected: false,
  });
  const [landingChatOpen, setLandingChatOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { saveOutfit, savedOutfits, user } = useAuth();

  const {
    products,
    loading: recommendationsLoading,
    error: recommendationsError,
  } = useRecommendations(category, style);
  const detectedPose = cameraUnavailable
    ? "unknown"
    : tryOnMetrics.alignment === "tilted"
      ? "relaxed"
      : "upright";
  const detectedColors = useMemo(
    () => selectedProduct?.dominant_colors || [],
    [selectedProduct]
  );
  const assistantContext = useMemo(
    () => ({
      product: selectedProduct,
      analyticsVerdict:
        tryOnState === "complete"
          ? "AI try-on simulation preview rendered with upper-body fit context."
          : "Try-on preview is not complete yet.",
      savedWardrobeCount: savedOutfits.length,
      tryOnState,
      tryOnMetrics,
    }),
    [savedOutfits.length, selectedProduct, tryOnMetrics, tryOnState]
  );

  const tryOnWorkflowStages = useMemo(
    () => [
      ["extracting", "Extract Garment"],
      ["analyzing", "Detect Body Landmarks"],
      ["generating", "Build Body Mask"],
      ["generating", "Fit Garment"],
      ["rendering", "Render Try-On"],
    ],
    []
  );
  const activeTryOnStage = {
    idle: -1,
    extracting: 0,
    analyzing: 1,
    generating: 3,
    rendering: 4,
    complete: 4,
  }[tryOnState] ?? -1;

  useEffect(() => {
    let cancelled = false;
    let activeStream;

    const enableCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera not supported");
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
      "Analyzing outfit...",
      "Mapping silhouette...",
      "Reading style signal...",
      "Preparing try-on preview...",
    ];

    let index = 0;
    const interval = setInterval(() => {
      setLoadingText(texts[index]);
      index = (index + 1) % texts.length;
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      tryOnTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }, []);

  const startVoiceAssistant = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Voice assistant is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.start();
    setListening(true);

    recognition.onresult = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  }, [showToast]);

  const startWorkspace = useCallback(() => {
    setWorkspaceOpen(true);
    setActiveTab("try-on");
  }, []);

  const watchDemo = useCallback(() => {
    setWorkspaceOpen(true);
    setActiveTab("analytics");
  }, []);

  const openTab = useCallback((tab) => {
    if (tab === "assistant") {
      setLandingChatOpen(false);
    }
    setActiveTab(tab);
  }, []);

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
      showToast("Outfit saved to your wardrobe");
    },
    [category, saveOutfit, showToast, style, user]
  );

  const startTryOnSimulation = useCallback(() => {
    tryOnTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    tryOnTimersRef.current = [];

    setTryOnState("extracting");
    setLoadingText("Extracting garment from product link...");

    const analyzingTimer = window.setTimeout(() => {
      setTryOnState("analyzing");
      setLoadingText("Detecting body landmarks...");
    }, 650);

    const generatingTimer = window.setTimeout(() => {
      setTryOnState("generating");
      setLoadingText("Aligning shirt to torso...");
    }, 1350);

    const renderingTimer = window.setTimeout(() => {
      setTryOnState("rendering");
      setLoadingText("Rendering AI try-on preview...");
    }, 1950);

    const completeTimer = window.setTimeout(() => {
      setTryOnState("complete");
      setLoadingText("AI try-on preview ready");
      showToast("AI try-on preview ready");
    }, 2850);

    tryOnTimersRef.current = [
      analyzingTimer,
      generatingTimer,
      renderingTimer,
      completeTimer,
    ];
  }, [showToast]);

  const renderAuraDock = () => (
    <div
      className={`fixed right-4 z-30 flex items-center gap-2 rounded-full border border-stone-200/10 bg-black/82 p-2 shadow-2xl shadow-black/45 backdrop-blur-xl transition duration-300 sm:right-8 lg:left-6 lg:right-auto ${
        workspaceOpen ? "bottom-24 lg:bottom-6" : "bottom-5 sm:bottom-8"
      }`}
    >
      <button
        type="button"
        onClick={startVoiceAssistant}
        aria-label={listening ? "Voice assistant listening" : "Start voice assistant"}
        className="button-press inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#e6d8c3] text-black hover:-translate-y-0.5 hover:bg-white"
      >
        <Mic size={18} />
      </button>
      <button
        type="button"
        onClick={() => setLandingChatOpen(true)}
        aria-label="Open Aura Stylist chat"
        className="button-press inline-flex h-11 items-center justify-center gap-2 rounded-full border border-stone-200/10 bg-stone-100/[0.04] px-4 text-xs font-black text-stone-100 hover:-translate-y-0.5 hover:border-[#d6c2a1]/40"
      >
        <MessageCircle size={17} />
        Aura
      </button>
    </div>
  );

  const renderWorkspacePage = () => {
    if (activeTab === "try-on") {
      return (
        <section className="mx-auto w-full max-w-6xl space-y-5">
          <ProductPreview
            category={category}
            productUrl={productUrl}
            setProductUrl={setProductUrl}
            onSelectCategory={setCategory}
            tryOnState={tryOnState}
            onProductChange={setSelectedProduct}
            onStartTryOn={startTryOnSimulation}
            onSave={() =>
              handleSaveOutfit({
                title: selectedProduct?.title || "AI Preview Look",
                match: "Preview",
                tag: "Try-On",
                image:
                  selectedProduct?.image ||
                  products[0]?.image ||
                  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
              })
            }
          />

          <div className="rounded-[26px] border border-stone-200/10 bg-stone-100/[0.025] p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d6c2a1]">
              Section 2 / Style Setup
            </p>
            <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-start">
              <div>
                <h2 className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-stone-500">
                  Product Category
                </h2>
                <ProductTabs
                  categories={CATEGORIES}
                  category={category}
                  setCategory={setCategory}
                />
              </div>
              <StyleSelector
                styles={STYLES}
                style={style}
                setStyle={setStyle}
                compact
              />
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
            <TrackingPanel
              videoRef={videoRef}
              canvasRef={canvasRef}
              loadingText={loadingText}
              cameraUnavailable={cameraUnavailable}
              category={category}
              compact
              tryOnState={tryOnState}
              product={selectedProduct}
              onMetricsChange={setTryOnMetrics}
            />

            <div className="rounded-[28px] border border-stone-200/10 bg-stone-100/[0.025] p-3 sm:p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d6c2a1]">
                AI Processing Pipeline
              </p>
              <div className="mt-3 space-y-2">
                {tryOnWorkflowStages.map(([, step], index) => (
                  <div
                    key={step}
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-xs font-bold ${
                      activeTryOnStage >= index
                        ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                        : "border-stone-200/10 bg-black/25 text-stone-400"
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6d8c3] text-xs font-black text-black">
                      {activeTryOnStage >= index ? "OK" : index + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.055] p-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100">
                  Fitting Indicators
                </p>
                <div className="mt-3 space-y-2 text-xs font-black text-stone-300">
                  {[
                    ["Shoulder Fit", `${tryOnMetrics.shoulderFit || 0}%`],
                    ["Torso Coverage", `${tryOnMetrics.torsoCoverage || 0}%`],
                    ["Alignment", tryOnMetrics.alignmentVerdict || "Waiting"],
                    ["Fit Confidence", `${tryOnMetrics.fitConfidence || tryOnMetrics.confidence || 0}%`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/10 bg-black/25 px-3 py-2"
                    >
                      <span>{label}</span>
                      <span className="text-[#e6d8c3]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-stone-200/10 bg-black/25 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d6c2a1]">
                  More insights
                </p>
                <p className="mt-1 text-sm font-semibold text-stone-400">
                  Keep the main flow focused, then review supporting intelligence when needed.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["assistant", "Ask Aura"],
                  ["recommendations", "Recommendations"],
                  ["analytics", "Analytics"],
                  ["wardrobe", "Wardrobe"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => openTab(id)}
                    className="button-press rounded-full border border-stone-200/10 bg-stone-100/[0.04] px-3 py-2 text-xs font-black text-stone-200 hover:-translate-y-0.5 hover:border-[#d6c2a1]/35 hover:text-[#e6d8c3]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (activeTab === "recommendations") {
      return (
        <section className="mx-auto w-full max-w-6xl">
          <RecommendationPanel
            products={products}
            style={style}
            loading={recommendationsLoading}
            error={recommendationsError}
            onSaveOutfit={handleSaveOutfit}
            onFavoriteRecommendation={handleSaveOutfit}
          />
        </section>
      );
    }

    if (activeTab === "analytics") {
      return (
        <section className="mx-auto grid w-full max-w-6xl gap-5 xl:grid-cols-2">
          <AIAnalytics
            category={category}
            style={style}
            colors={detectedColors}
            pose={detectedPose}
            tryOnMetrics={tryOnMetrics}
            compact
          />
          <OutfitInsights category={category} style={style} pose={detectedPose} />
          <div className="xl:col-span-2">
            <BeforeAfter />
          </div>
        </section>
      );
    }

    if (activeTab === "wardrobe") {
      return (
        <section className="mx-auto w-full max-w-5xl">
          <SavedOutfitsPanel onLogin={() => setLoginOpen(true)} />
        </section>
      );
    }

    return (
      <section className="mx-auto w-full max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[26px] border border-stone-200/10 bg-stone-100/[0.025] p-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d6c2a1]">
              Aura Stylist
            </p>
            <h2 className="mt-1 text-xl font-black text-stone-50">
              Ask for outfit, color, and occasion guidance.
            </h2>
          </div>
          <VoiceAssistant
            startVoiceAssistant={startVoiceAssistant}
            listening={listening}
          />
        </div>
        <AIChatPanel
          embedded
          open
          onClose={() => {}}
          category={category}
          style={style}
          assistantContext={assistantContext}
          detectedColors={detectedColors}
        />
      </section>
    );
  };

  return (
    <main
      className={
        workspaceOpen
          ? "ambient-runway min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_20%_8%,rgba(214,194,161,0.16),transparent_24%),radial-gradient(circle_at_80%_14%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(135deg,#070706_0%,#11100e_52%,#050505_100%)] text-stone-50"
          : "min-h-screen overflow-x-hidden bg-background text-foreground"
      }
    >
      {!workspaceOpen ? (
        <LandingPage
          onStartStyling={startWorkspace}
          onWatchDemo={watchDemo}
          onSignIn={() => setLoginOpen(true)}
          onOpenChat={() => setLandingChatOpen(true)}
          onStartVoice={startVoiceAssistant}
          listening={listening}
          assistantHidden={landingChatOpen}
          heroImage={HERO_IMAGE}
          userMenu={<UserMenu onLogin={() => setLoginOpen(true)} />}
        />
      ) : (
        <section className="workspace-enter min-h-screen px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:pb-5">
          <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] rounded-[30px] border border-stone-200/10 bg-stone-100/[0.025] p-4 lg:block">
              <button
                type="button"
                onClick={() => setWorkspaceOpen(false)}
                className="flex items-center gap-3 text-left text-lg font-black"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-100 text-black">
                  A
                </span>
                AI Stylist
              </button>

              <nav className="mt-8 space-y-1">
                {["primary", "secondary"].map((group) => (
                  <div key={group} className={group === "secondary" ? "pt-5" : ""}>
                    <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">
                      {group === "primary" ? "Main flow" : "More insights"}
                    </p>
                    {NAV_ITEMS.filter(([, , , itemGroup]) => itemGroup === group).map(
                      ([id, label, Icon]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => openTab(id)}
                          className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-3 transition ${
                            activeTab === id
                              ? "bg-stone-100 text-black"
                              : group === "primary"
                                ? "py-3 text-sm font-black text-stone-300 hover:bg-stone-100/[0.06] hover:text-white"
                                : "py-2.5 text-xs font-bold text-stone-500 hover:bg-stone-100/[0.045] hover:text-stone-200"
                          }`}
                        >
                          <Icon size={17} />
                          {label}
                        </button>
                      )
                    )}
                  </div>
                ))}
              </nav>
            </aside>

            <div className="min-w-0">
              <header className="mb-5 flex items-center justify-between gap-4 rounded-[28px] border border-stone-200/10 bg-stone-100/[0.025] px-4 py-3 lg:px-5">
                <button
                  type="button"
                  onClick={() => setWorkspaceOpen(false)}
                  className="flex items-center gap-3 text-sm font-black lg:hidden"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-stone-100 text-black">
                    A
                  </span>
                  AI Stylist
                </button>
                <div className="hidden lg:block">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d6c2a1]">
                    Workspace
                  </p>
                  <h1 className="mt-1 text-xl font-black">
                    {NAV_ITEMS.find(([id]) => id === activeTab)?.[1]}
                  </h1>
                </div>
                <UserMenu onLogin={() => setLoginOpen(true)} />
              </header>

              <div className="editorial-fade">{renderWorkspacePage()}</div>
            </div>
          </div>

          <nav className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-5 rounded-3xl border border-stone-200/10 bg-black/82 p-1 text-[10px] font-black text-stone-300 shadow-2xl shadow-black/50 backdrop-blur lg:hidden">
            {NAV_ITEMS.map(([id, label, Icon]) => (
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
        </section>
      )}

      {workspaceOpen && activeTab !== "assistant" && !landingChatOpen && renderAuraDock()}

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      <AIChatPanel
        open={landingChatOpen && activeTab !== "assistant"}
        onClose={() => setLandingChatOpen(false)}
        category={category}
        style={style}
        assistantContext={assistantContext}
        detectedColors={detectedColors}
      />

      {!workspaceOpen && listening && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-cyan-500/30 bg-black/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 backdrop-blur">
          Listening...
        </div>
      )}

      {toast && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full border border-stone-200/15 bg-zinc-950/95 px-5 py-3 text-sm font-black text-stone-100 shadow-2xl shadow-black/40 backdrop-blur">
          {toast}
        </div>
      )}
    </main>
  );
}

export default Dashboard;

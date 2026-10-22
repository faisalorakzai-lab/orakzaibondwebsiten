import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useInView, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Building2,
  Landmark,
  Shield,
  Zap,
} from "lucide-react";
import "./LiveVaultStatus.css";

const SovereignVaultScene = lazy(() => import("./SovereignVaultScene"));

const allocations = [
  {
    id: "city",
    name: "Azaan Smart City",
    percent: 60,
    amount: "$4,500,000",
    description: "Real estate allocation",
    detail: "Illustrative amount",
    icon: Building2,
    start: 0,
    end: 216,
  },
  {
    id: "outlets",
    name: "Shamim Forever Global Outlets",
    percent: 20,
    amount: "$1,500,000",
    description: "Global outlet expansion target: 10+ outlets",
    detail: "Stated expansion target",
    icon: Landmark,
    start: 216,
    end: 288,
  },
  {
    id: "security",
    name: "Security Reserve",
    percent: 10,
    amount: "$750,000",
    description: "Planned five-year security lock",
    detail: "Planned reserve target",
    icon: Shield,
    start: 288,
    end: 324,
  },
  {
    id: "utilities",
    name: "Utilities",
    percent: 10,
    amount: "$750,000",
    description: "Utility and ecosystem infrastructure",
    detail: "Illustrative infrastructure target",
    icon: Zap,
    start: 324,
    end: 360,
  },
] as const;

const vaultAddress = "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08";
const vaultExplorerUrl =
  "https://polygonscan.com/address/0x3cb45d2022e2e15afa8c4822647b89935a2ced08";

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function StaticVault({ selectedIndex }: { selectedIndex: number }) {
  const selected = allocations[selectedIndex];
  const ringStyle: CSSProperties & {
    "--sv-active-start": string;
    "--sv-active-end": string;
  } = {
    "--sv-active-start": selected.start + "deg",
    "--sv-active-end": selected.end + "deg",
  };

  return (
    <div className="sv-static-vault" style={ringStyle} aria-hidden="true">
      <div className="sv-static-backplate" />
      <div className="sv-static-ring" />
      <div className="sv-static-inner-ring" />
      <div className="sv-static-core" />
      {allocations.map(({ id, icon: Icon }, index) => (
        <span
          key={id}
          className={
            "sv-static-node sv-static-node--" +
            (index + 1) +
            (index === selectedIndex ? " is-active" : "")
          }
        >
          <Icon strokeWidth={1.6} />
        </span>
      ))}
    </div>
  );
}

class SceneBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function LiveVaultStatus() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const nearViewport = useInView(sectionRef, {
    once: true,
    margin: "220px 0px",
  });
  const sectionVisible = useInView(sectionRef);
  const reducedMotion = useReducedMotion() ?? false;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);
  const selected = allocations[selectedIndex];
  const SelectedIcon = selected.icon;
  const sceneReady = nearViewport && webglAvailable === true && !reducedMotion;
  const staticVisual = <StaticVault selectedIndex={selectedIndex} />;

  useEffect(() => {
    if (nearViewport && !reducedMotion) {
      setWebglAvailable(canUseWebGL());
    }
  }, [nearViewport, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="live-vault"
      className="sv-section"
      aria-labelledby="sv-heading"
    >
      <div className="sv-wrap">
        <header className="sv-heading">
          <span className="sv-eyebrow">
            <span className="sv-eyebrow-dot" aria-hidden="true" />
            OKBOND Financial Infrastructure
          </span>
          <h2 id="sv-heading">The Sovereign Vault</h2>
          <p>
            A transparent view of OKBOND&apos;s stated capital allocation and
            ecosystem strategy.
          </p>
        </header>

        <div className="sv-layout">
          <div className="sv-visual">
            <div
              className="sv-stage"
              role="img"
              aria-label={
                "Three-dimensional vault illustration. Selected stated allocation: " +
                selected.name +
                ", " +
                selected.percent +
                " percent, " +
                selected.amount +
                ". Select an allocation card to highlight it."
              }
            >
              <div className="sv-scene" aria-hidden="true">
                {sceneReady ? (
                  <SceneBoundary fallback={staticVisual}>
                    <Suspense fallback={staticVisual}>
                      <SovereignVaultScene
                        activeIndex={selectedIndex}
                        animate={sectionVisible && !reducedMotion}
                      />
                    </Suspense>
                  </SceneBoundary>
                ) : (
                  staticVisual
                )}
              </div>
              <div className="sv-model-label" aria-hidden="true">
                <span className="sv-model-icon">
                  <SelectedIcon strokeWidth={1.7} />
                </span>
                <span className="sv-model-kicker">Selected allocation</span>
                <strong>{selected.name}</strong>
                <span className="sv-model-amount">{selected.amount}</span>
                <span className="sv-model-percent">{selected.percent}%</span>
              </div>
            </div>
            <p className="sv-stage-caption">
              {reducedMotion
                ? "Static illustration · motion reduced"
                : "Interactive 3D model · no live balance displayed"}
            </p>

            <div className="sv-total">
              <div>
                <span className="sv-total-label">Stated Allocation</span>
                <strong className="sv-total-value">$7,500,000</strong>
              </div>
              <span className="sv-total-note">
                Illustrative total
                <br />
                Not a live reserve balance
              </span>
            </div>
          </div>

          <div className="sv-allocation-panel">
            <div className="sv-panel-head">
              <h3>Allocation Breakdown</h3>
              <span className="sv-status">STATED TARGETS · ILLUSTRATIVE</span>
            </div>
            <div
              className="sv-card-grid"
              role="group"
              aria-label="Select an allocation to highlight it in the vault illustration"
            >
              {allocations.map((item, index) => {
                const Icon = item.icon;
                const active = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="sv-card"
                    aria-pressed={active}
                    aria-label={
                      item.name +
                      ": " +
                      item.percent +
                      " percent, " +
                      item.amount +
                      ". " +
                      item.description
                    }
                    onClick={() => setSelectedIndex(index)}
                  >
                    <span className="sv-card-top">
                      <span className="sv-card-title">
                        <span className="sv-card-icon" aria-hidden="true">
                          <Icon strokeWidth={1.7} />
                        </span>
                        <span className="sv-card-name">{item.name}</span>
                      </span>
                      <span className="sv-card-pct">{item.percent}%</span>
                    </span>
                    <span className="sv-card-amount">{item.amount}</span>
                    <span className="sv-card-desc">{item.description}</span>
                    <span className="sv-card-foot">{item.detail}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <section
          className="sv-transparency"
          aria-labelledby="sv-transparency-heading"
        >
          <div className="sv-transparency-head">
            <h3 id="sv-transparency-heading">Project Allocation Details</h3>
            <span className="sv-record-note">
              Figures and plans as stated in the supplied project brief
            </span>
          </div>
          <dl className="sv-detail-grid">
            <div className="sv-detail">
              <dt>Total stated allocation</dt>
              <dd>US$7,500,000</dd>
            </div>
            <div className="sv-detail">
              <dt>Allocation mix</dt>
              <dd>60% · 20% · 10% · 10%</dd>
            </div>
            <div className="sv-detail">
              <dt>Network configured in project</dt>
              <dd>Polygon PoS · Chain ID 137</dd>
            </div>
            <div className="sv-detail">
              <dt>Vault contract address</dt>
              <dd>
                <a
                  className="sv-contract"
                  href={vaultExplorerUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="View the OKBOND vault address on PolygonScan, opens in a new tab"
                >
                  <span>{vaultAddress}</span>
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </dd>
            </div>
            <div className="sv-detail">
              <dt>Allocation source</dt>
              <dd>Stated project targets; not read from the contract</dd>
            </div>
            <div className="sv-detail">
              <dt>Reserve data</dt>
              <dd>Not displayed as live data</dd>
            </div>
            <div className="sv-detail">
              <dt>Audit document</dt>
              <dd>No audit link is included in this section</dd>
            </div>
            <div className="sv-detail">
              <dt>Source update date</dt>
              <dd>Not provided</dd>
            </div>
          </dl>
          <p className="sv-disclaimer">
            <strong>Allocation note:</strong> Amounts, percentages, and plans
            are stated targets supplied for this section. They are not live
            TVL, proof of asset ownership or reserves, or an audit.
          </p>
          <p className="sv-live-claim">
            <Activity aria-hidden="true" />
            This section does not fetch the displayed allocation figures from
            the blockchain; the contract address is shown for reference.
          </p>
        </section>
      </div>
    </section>
  );
}

import { useState, type CSSProperties } from "react";
import { Activity, ArrowUpRight, Building2, Landmark, Shield, Zap } from "lucide-react";
import "./LiveVaultStatus.css";

const allocations = [
  {
    id: "city",
    name: "Azaan Smart City",
    percent: "60%",
    amount: "$4,500,000",
    description: "Real estate allocation",
    detail: "Illustrative allocation",
    icon: Building2,
    start: 0,
    end: 216,
  },
  {
    id: "outlets",
    name: "Shamim Forever Global Outlets",
    percent: "20%",
    amount: "$1,500,000",
    description: "Global outlet expansion target: 10+ outlets",
    detail: "Illustrative expansion target",
    icon: Landmark,
    start: 216,
    end: 288,
  },
  {
    id: "security",
    name: "Security Reserve",
    percent: "10%",
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
    percent: "10%",
    amount: "$750,000",
    description: "Utility and ecosystem infrastructure",
    detail: "Illustrative infrastructure target",
    icon: Zap,
    start: 324,
    end: 360,
  },
] as const;

const vaultAddress = "0x3Cb45d2022e2E15AFa8C4822647B89935a2ceD08";
const vaultExplorerUrl = "https://polygonscan.com/address/0x3cb45d2022e2e15afa8c4822647b89935a2ced08";

export default function LiveVaultStatus() {
  const [selectedId, setSelectedId] = useState<string>(allocations[0].id);
  const selected = allocations.find((item) => item.id === selectedId) ?? allocations[0];
  const ringStyle: CSSProperties & { "--sv-active-start": string; "--sv-active-end": string } = {
    "--sv-active-start": selected.start + "deg",
    "--sv-active-end": selected.end + "deg",
  };

  return (
    <section id="live-vault" className="sv-section" aria-labelledby="sv-heading">
      <div className="sv-wrap">
        <header className="sv-heading">
          <span className="sv-eyebrow">
            <span className="sv-eyebrow-dot" aria-hidden="true" />
            OKBOND Financial Infrastructure
          </span>
          <h2 id="sv-heading">The Sovereign Vault</h2>
          <p>
            A transparent view of OKBOND&apos;s stated capital allocation and ecosystem strategy.
          </p>
        </header>

        <div className="sv-layout">
          <div className="sv-visual">
            <div
              className="sv-stage"
              role="img"
              aria-label={
                "CSS 3D vault illustration. Selected allocation: " + selected.name + ", " +
                selected.percent + ", " + selected.amount + ". Select an allocation card to highlight it."
              }
            >
              <div className="sv-vault" aria-hidden="true">
                <div className="sv-vault__backplate" />
                <div className="sv-vault__ring" style={ringStyle} />
                <div className="sv-vault__inner-ring" />
                <div className="sv-vault__core">
                  <span className="sv-core-kicker">Selected allocation</span>
                  <span className="sv-core-name">{selected.name}</span>
                  <span className="sv-core-amount">{selected.amount}</span>
                  <span className="sv-core-percent">{selected.percent}</span>
                </div>
                {allocations.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <span
                      key={item.id}
                      className={
                        "sv-node sv-node--" + (index + 1) +
                        (item.id === selected.id ? " is-active" : "")
                      }
                    >
                      <Icon strokeWidth={1.6} />
                    </span>
                  );
                })}
              </div>
              <span className="sv-stage-caption">Lightweight CSS 3D · no live balance is shown</span>
            </div>

            <div className="sv-total">
              <div>
                <span className="sv-total-label">Stated Allocation</span>
                <strong className="sv-total-value">$7,500,000</strong>
              </div>
              <span className="sv-total-note">Illustrative total</span>
            </div>
          </div>

          <div className="sv-allocation-panel">
            <div className="sv-panel-head">
              <h3>Allocation Breakdown</h3>
            </div>
            <div className="sv-card-grid" aria-label="Select an allocation to highlight it in the vault visualization">
              {allocations.map((item) => {
                const Icon = item.icon;
                const active = item.id === selected.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="sv-card"
                    aria-pressed={active}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span className="sv-card-top">
                      <span className="sv-card-title">
                        <span className="sv-card-icon"><Icon strokeWidth={1.7} /></span>
                        <span className="sv-card-name">{item.name}</span>
                      </span>
                      <span className="sv-card-pct">{item.percent}</span>
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

        <section className="sv-transparency" aria-labelledby="sv-transparency-heading">
          <div className="sv-transparency-head">
            <h3 id="sv-transparency-heading">Transparency Record</h3>
            <span className="sv-record-note">Source details listed as recorded in the repository</span>
          </div>
          <dl className="sv-detail-grid">
            <div className="sv-detail">
              <dt>Total stated allocation</dt>
              <dd>US$7,500,000</dd>
            </div>
            <div className="sv-detail">
              <dt>Allocation breakdown</dt>
              <dd>60% · 20% · 10% · 10%</dd>
            </div>
            <div className="sv-detail">
              <dt>Blockchain network</dt>
              <dd>Polygon PoS · Chain ID 137</dd>
            </div>
            <div className="sv-detail">
              <dt>OKBOND vault contract</dt>
              <dd>
                <a className="sv-contract" href={vaultExplorerUrl} target="_blank" rel="noreferrer noopener">
                  <span>{vaultAddress}</span><ArrowUpRight aria-hidden="true" />
                </a>
              </dd>
            </div>
            <div className="sv-detail">
              <dt>Record status</dt>
              <dd>Stated allocation record</dd>
            </div>
            <div className="sv-detail">
              <dt>Vault source record</dt>
              <dd>
                Source record on PolygonScan
                <br />Contract source information is listed separately from allocation figures.
              </dd>
            </div>
            <div className="sv-detail">
              <dt>Source reference</dt>
              <dd>
                Polygon PoS · Chain ID 137
                <br />Repository deployment record and PolygonScan reference
              </dd>
            </div>
            <div className="sv-detail">
              <dt>Independent audit</dt>
              <dd>Not submitted, per repository record</dd>
            </div>
            <div className="sv-detail">
              <dt>Last verified update</dt>
              <dd>Not recorded in the source record</dd>
            </div>
            <div className="sv-detail">
              <dt>Contract source record</dt>
              <dd>Repository record linked to PolygonScan</dd>
            </div>
          </dl>
          <p className="sv-disclaimer">
            <strong>Transparency note:</strong> Allocation figures and percentages are illustrative stated targets. They are not live TVL, proof of asset backing, or an audit.
          </p>
          <p className="sv-live-claim">
            <Activity aria-hidden="true" />
            No real-time reserve balance or verification timestamp is available here; none is presented as live data.
          </p>
        </section>
      </div>
    </section>
  );
}

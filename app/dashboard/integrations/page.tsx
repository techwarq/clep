"use client";

import { Ico } from "../../../components/dash/icons";
import { PageHead, Soon } from "../../../components/dash/ui";

const TRIGGERS = [
  ["PR label", "Add the clep label to a pull request"],
  ["Commit trailer", "Clep-Feature: export report"],
];

/** GitHub: push a feature → launch video on the PR (Platform Plan §4). */
export default function Integrations() {
  return (
    <div className="cd-page cd-narrow">
      <PageHead title="Integrations" sub="Push a feature, get the launch video. Clep films it on the preview deploy and comments on the PR." />

      <section className="cd-card">
        <div className="cd-card-head">
          <div className="cd-int-title">
            <span className="cd-int-ico">{Ico.github}</span>
            <div>
              <h2>GitHub <Soon /></h2>
              <p>A clip and a “Try it” link on every pull request.</p>
            </div>
          </div>
          <button type="button" className="cd-btn cd-btn-pink" disabled>Connect repo</button>
        </div>

        <h3 className="cd-side-h">Trigger</h3>
        <ul className="cd-radio-list">
          {TRIGGERS.map(([name, text], i) => (
            <li key={name} className={i === 0 ? "on" : ""}>
              <span className="cd-radio" />
              <div>
                <b>{name}</b>
                <code>{text}</code>
              </div>
            </li>
          ))}
        </ul>

        <h3 className="cd-side-h">On the PR</h3>
        <div className="cd-pr">
          <p><b>clep-bot</b> commented on #482</p>
          <div className="cd-pr-body">
            <span className="cd-pr-thumb">{Ico.play}</span>
            <div>
              <b>Export report: 18s demo</b>
              <small>Recorded on the preview deploy</small>
              <span className="cd-pr-links"><u>▶ Watch</u><u>Try it</u></span>
            </div>
          </div>
        </div>
      </section>

      <section className="cd-card">
        <div className="cd-card-head">
          <div>
            <h2>API and webhooks <Soon /></h2>
            <p>Start renders from your own tools and get a webhook when a clip is ready. Studio plan.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

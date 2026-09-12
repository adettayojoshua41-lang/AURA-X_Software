const STATE_LABELS = {
  idle: "AURA is ready",
  listening: "AURA is listening",
  thinking: "AURA is thinking",
  responding: "AURA is responding",
  success: "AURA completed the task",
  warning: "AURA needs attention",
};

export default function AuraCore({ state = "idle", size = "md", label }) {
  const currentState = STATE_LABELS[state] ? state : "idle";
  const accessibleLabel = label || STATE_LABELS[currentState];

  return (
    <div
      className={`aura-core aura-core-${size} aura-core-${currentState}`}
      role="img"
      aria-label={accessibleLabel}
    >
      <span className="aura-core-ring aura-core-ring-outer" />
      <span className="aura-core-ring aura-core-ring-inner" />
      <span className="aura-core-network" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="aura-core-orb" />
    </div>
  );
}

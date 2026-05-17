import type { AppState } from '../../shared/types';

export function LogsView({ state }: { state: AppState }) {
  return (
    <section className="panel">
      <h2>Local logs</h2>
      <div className="log-list">
        {state.logs.map((log) => (
          <article className={`log-line ${log.level}`} key={log.id}>
            <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
            <strong>{log.level}</strong>
            <em>{log.scope}</em>
            <p>{log.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

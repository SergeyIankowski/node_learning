import { LinkButton } from '../components/ui';

export function NotFound() {
  return (
    <div className="page">
      <h1>Not found</h1>
      <p className="muted">This page doesn't exist.</p>
      <LinkButton to="/" variant="primary">
        Back to roadmap
      </LinkButton>
    </div>
  );
}

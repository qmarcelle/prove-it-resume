import { ProveItResume } from '@/components/ProveItResume';
import { defaultRole } from '@/content/roles';

/**
 * The durable evidence surface.
 *
 * Organisation-neutral by design. The design export defaulted to a specific employer;
 * the root deliberately does not, so this artifact stays true after any one application
 * closes. Organisation-specific framing lives at `/role/<slug>`.
 */
export default function Page() {
  return <ProveItResume lens={defaultRole} />;
}

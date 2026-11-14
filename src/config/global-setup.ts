import { rmSync } from 'node:fs';
import { ALLURE_RESULTS_DIR } from './paths';

export default function clearPreviousAllureResults(): void {
  rmSync(ALLURE_RESULTS_DIR, { recursive: true, force: true });
}

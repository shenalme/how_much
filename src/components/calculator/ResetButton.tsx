import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <Button variant="quiet" onClick={onReset}>
      <Icon name="reset" size={18} />
      Reset
    </Button>
  );
}

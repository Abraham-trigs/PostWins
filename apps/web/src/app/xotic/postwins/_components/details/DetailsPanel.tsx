import { DetailsPanelSelected } from "./DetailsPanelSelected";

type Props = {
  onOpenFullScreen?: () => void;
};

export function DetailsPanel({ onOpenFullScreen }: Props) {
  return <DetailsPanelSelected onOpenFullScreen={onOpenFullScreen} />;
}

import { JsonViewer } from '@textea/json-viewer';

interface JsonViewProps {
  data: unknown;
  collapsed?: boolean;
  theme?: "dark" | "light";
}

export function JsonView({ data, collapsed = false, theme = "light" }: JsonViewProps) {
  return (
    <JsonViewer 
      value={data}
      defaultInspectDepth={collapsed ? 1 : undefined}
      theme={theme}
      enableClipboard={false}
      editable={true}
    />
  );
}
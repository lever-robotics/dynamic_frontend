import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

interface JsonEditorProps {
  data: unknown;
  onChange: (data: { jsObject: unknown } | undefined) => void;
  height?: string;
}
// Currently not used
export function JsonEditor({ data, onChange, height = '550px' }: JsonEditorProps) {
  return (
    <JSONInput
      id="json-editor"
      placeholder={data}
      locale={locale}
      height={height}
      width="100%"
      onChange={onChange}
      style={{
        body: { fontSize: '13px' },
        outerBox: { border: '1px solid #ddd', borderRadius: '4px' },
        container: { backgroundColor: 'transparent' }
      }}
    />
  );
}
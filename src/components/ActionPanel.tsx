interface ActionPanelProps {
  button: JSX.Element;
  headerText: string;
  paragraphText: string | null;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ button, headerText, paragraphText }) => {
  return (
    <div className="flex flex-col w-1/5 items-center w=3/6 bg-white shadow rounded-3xl m-auto mt-36">
      <div className=" flex flex-col items-center px-4 py-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{headerText}</h3>
        {paragraphText && <p className="mt-2 text-center text-sm text-gray-500">{paragraphText}</p>}
      </div>
      {button}
    </div>
  );
};

ActionPanel.displayName = "ActionPanel";

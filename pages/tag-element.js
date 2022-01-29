
function TagEl({ details = {
    text: "",
    class: "bg-gray-200"
} }) {
    return (<span className={"inline-block " + details.class + " rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2"}>{details.text}</span>);
}

export default TagEl;
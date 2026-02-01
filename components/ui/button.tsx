// Placeholder Button component
export function Button(props) {
  return <button {...props}>{props.children || 'Button'}</button>;
}

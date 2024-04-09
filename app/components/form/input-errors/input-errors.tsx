type Props = {
  errors?: Array<string> | null;
  id: string;
};
export function InputErrors({ errors, id }: Props) {
  if (!errors?.length) return null;
  return (
    <ul id={id} className="list-inside">
      {errors.map((error) => (
        <li key={error} className="font-semibold text-destructive">
          {error}
        </li>
      ))}
    </ul>
  );
}

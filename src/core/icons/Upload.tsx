const Upload = ({ color = '#fff' }: { color?: string }): JSX.Element => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='14'
      height='15'
      fill='none'
      viewBox='0 0 14 15'
    >
      <path
        fill={color}
        d='M13 13.875a.403.403 0 00-.375-.375H1.375a.38.38 0 00-.375.375v.75c0 .219.156.375.375.375h11.25a.38.38 0 00.375-.375v-.75zM1.437 5.969C.5 6.906 1.157 8.5 2.5 8.5h1.594V11a1.5 1.5 0 001.5 1.5h2.781a1.5 1.5 0 001.5-1.5V8.5H11.5c1.313 0 2-1.594 1.031-2.531l-4.469-4.5C7.47.875 6.5.875 5.938 1.469l-4.5 4.5zM2.5 7L7 2.5 11.5 7H8.375v4H5.594V7H2.5z'
      ></path>
    </svg>
  );
};

export default Upload;

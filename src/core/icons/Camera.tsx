function Camera({ color = "#5959F7", width = "28", height = "24" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 28 24"
    >
      <path
        fillRule="evenodd"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M18.054 1.402c1.346.536 1.758 2.402 2.309 3.002.55.6 1.339.804 1.775.804a4.196 4.196 0 014.196 4.195v7.726a5.628 5.628 0 01-5.627 5.627H7.294a5.627 5.627 0 01-5.627-5.627V9.404a4.196 4.196 0 014.196-4.195c.435 0 1.223-.204 1.775-.804.55-.6.961-2.466 2.308-3.002 1.348-.536 6.761-.536 8.108 0z"
        clipRule="evenodd"
      ></path>
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21.327 8.667h.012"
      ></path>
      <path
        fillRule="evenodd"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M18.239 13.504a4.238 4.238 0 10-8.477-.001 4.238 4.238 0 008.477 0z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export default Camera;

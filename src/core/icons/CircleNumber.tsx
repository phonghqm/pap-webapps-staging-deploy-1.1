type CircleNumberProps = {
  size?: number;
  bg?: string;
  color?: string;
  number: string | number;
  fontSize?: number;
};

const CircleNumber = ({
  size = 32,
  bg = "#EBEBFF",
  color = "#5959F7",
  fontSize = 14,
  number,
}: CircleNumberProps): JSX.Element => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
    >
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={bg} />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill={color}
        fontSize={fontSize}
        fontFamily="Lexend Deca"
        fontWeight={700}
      >
        {number}
      </text>
    </svg>
  );
};

export default CircleNumber;

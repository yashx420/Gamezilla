import App from "../components/App";
// If you want to directly test StarRating, you can also render it here

export default function HomePage() {
  return (
    <>
      <App />
      {/* 
      <StarRating
        maxRating={5}
        messages={["Terrible", "Bad", "Okay", "Good", "Amazing!"]}
        defaultRating={0}
      /> 
      */}
    </>
  );
}

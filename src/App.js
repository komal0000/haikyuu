import logo from "./logo.svg";
import "./css/index.css";
import "./App.css";
import Head from "./singlepage/head/head";
import Mid from "./singlepage/midsection/mid";
import Footer from "./singlepage/footer/footer";
const App = () => {
  return (
    <div className="container">
      <Head />
      <Mid />
      <Footer />
    </div>
  );
};

export default App;

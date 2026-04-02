import React from "react";
import "./head.css";
import { BsSearch } from "react-icons/bs";
import { IoIosNotificationsOutline } from "react-icons/io";
const Head = () => {
  return (
    <div className="main">
      <div className="row">
        <div className="col-md-2">
          <div className="logo">HAIKYUU</div>
        </div>
        <div className="col-md-8">
          <div className="midsection">
            <button className="btn">About</button>
            <button className="btn">Episode</button>
            <button className="btn">Character</button>
            <button className="btn">Wiki</button>
            <button className="btn">Merch</button>
            <button className="btn">Blog</button>
          </div>
        </div>
        <div className="col-md-2">
          <BsSearch className="search" />
          <IoIosNotificationsOutline className="notification" />
        </div>
      </div>
    </div>
  );
};

export default Head;

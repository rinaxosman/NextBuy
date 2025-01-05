import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomCloseButton from "./CustomCloseButton";

const App = () => {
  const [url, setUrl] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [darkMode, setDarkMode] = useState(false); // Dark mode state

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/wishlist");
      setWishlist(data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const addItem = async () => {
    try {
      await axios.post("http://localhost:5000/add-item", { url });
      setUrl("");
      fetchWishlist();
      toast.success("Item added to wishlist!");
    } catch (error) {
      console.error("Error adding item:", error);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while adding the item.");
      }
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/remove-item/${id}`);
      fetchWishlist();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const markAsPurchased = async (id) => {
    try {
      const { data } = await axios.patch(`http://localhost:5000/mark-purchased/${id}`);
      setWishlist((prev) =>
        prev.map((item) => (item._id === data._id ? data : item))
      );
      toast.success("🎉 Item marked as purchased!", {
        icon: false, // Disable the default checkmark icon
      });
    } catch (error) {
      console.error("Error marking item as purchased:", error);
      toast.error("Failed to mark item as purchased.");
    }
  };


  const returnToWishlist = async (id) => {
    try {
      const { data } = await axios.patch(`http://localhost:5000/return-to-wishlist/${id}`);
      setWishlist((prev) =>
        prev.map((item) => (item._id === data._id ? data : item))
      );

      toast(
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              backgroundColor: "yellow",
              color: "black",
              fontSize: "16px",
              fontWeight: "bold",
              textAlign: "center",
              lineHeight: "20px",
              borderRadius: "50%",
            }}
          >
            ↩
          </span>
          Item returned to wishlist!
        </div>,
        {
          icon: false, // Disable the default toast icon
          progressStyle: { backgroundColor: "yellow" }, // Solid yellow progress bar
          className: "Toastify__toast--return", // Ensure no border or unwanted effects
        }
      );


    } catch (error) {
      console.error("Error returning item to wishlist:", error);
      toast.error("Failed to return item to wishlist.");
    }
  };


  const deletePurchasedItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item permanently?")) {
      try {
        await axios.delete(`http://localhost:5000/remove-item/${id}`);
        fetchWishlist();
        toast.success("Item deleted permanently!");
      } catch (error) {
        console.error("Error deleting item:", error);
        toast.error("Failed to delete item.");
      }
    }
  };

  const groupByStore = (items) => {
    return items.reduce((groups, item) => {
      const storeName = new URL(item.url).hostname.replace(/^www\./, ""); // Remove 'www.' if it exists
      if (!groups[storeName]) {
        groups[storeName] = [];
      }
      groups[storeName].push(item);
      return groups;
    }, {});
  };

  useEffect(() => {
    fetchWishlist();
  }, []);
  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "";
  }, [darkMode]);


  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <button
        className="toggle-dark-mode"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <ToastContainer
        closeButton={<CustomCloseButton />}
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <header className="app-header">
        {/* <h2>What's your</h2> */}
        <h1>My NextBuy...</h1>
      </header>

      <div className="input-container">
        <input
          type="text"
          placeholder="Enter item URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={addItem}>Add to Wishlist</button>
      </div>

      {/* Wishlist Items */}
      <div className="wishlist-container">
        {Object.entries(groupByStore(wishlist.filter((item) => !item.purchased))).map(([storeName, items]) => (
          <div key={storeName} className="store-group">
            <h2 className="store-name">
              <a
                href={`https://${storeName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="store-link"
              >
                {storeName}
              </a>
              <span
                className="open-all-links"
                onClick={() => {
                  items.forEach((item) => {
                    window.open(item.url, "_blank", "noopener,noreferrer");
                  });
                }}
                title="Open all links in new tabs"
              >
                <i className="fas fa-external-link-alt"></i>
              </span>
            </h2>


            <div className="store-items">
              {items.map((item) => (
                <div className="wishlist-item" key={item._id}>
                  <span className="remove-item" onClick={() => removeItem(item._id)}>
                    &times;
                  </span>
                  <span
                    className="mark-purchased"
                    onClick={() => markAsPurchased(item._id)}
                  >
                    ✓
                  </span>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <img src={item.image} alt="item" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>


      {/* Purchased Items */}
      {wishlist.some((item) => item.purchased) && (
        <div className="wishlist-container">
          <div className="store-group">
            <h2 className="store-name">Purchased Items</h2>
            <div className="store-items">
              {wishlist
                .filter((item) => item.purchased)
                .map((item) => (
                  <div className="wishlist-item" key={item._id}>
                    <span
                      className="mark-return"
                      onClick={() => returnToWishlist(item._id)}
                    >
                      ↩
                    </span>
                    <span
                      className="remove-item"
                      onClick={() => deletePurchasedItem(item._id)}
                    >
                      &times;
                    </span>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <img src={item.image} alt="item" />
                    </a>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default App;

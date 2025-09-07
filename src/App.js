// Author: Cva
import React, { useEffect, useState } from 'react';

const currency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [p, c] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/cart').then(r => r.json()),
      ]);
      setProducts(p);
      setCart(c);
    } catch (e) {
      setError('Failed to load data. Is the backend running on :8080?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const addToCart = async (productId) => {
    await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    fetchAll();
  };

  const clearCart = async () => {
    await fetch('/api/cart/clear', { method: 'POST' });
    fetchAll();
  };

  const removeItem = async (id) => {
    await fetch(`/api/cart/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const updateQty = async (id, qty) => {
    await fetch(`/api/cart/${id}/quantity/${qty}`, { method: 'POST' });
    fetchAll();
  };

  const total = cart.reduce((sum, it) => sum + (it.product.price * it.quantity), 0);

  if (loading) return <div className="container"><h2>Loading…</h2></div>;
  if (error) return <div className="container"><h2>{error}</h2></div>;

  return (
    <div className="container">
      <header>
        <h1>Shopping Cart <small>— Cva</small></h1>
      </header>

      <section className="products">
        <h2>Products</h2>
        <div className="grid">
          {products.map(p => (
            <div key={p.id} className="card">
              <h3>{p.name}</h3>
              <p className="muted">{p.description}</p>
              <div className="row">
                <span className="price">{currency(p.price)}</span>
                <button onClick={() => addToCart(p.id)}>Add</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cart">
        <h2>Cart</h2>
        {cart.length === 0 ? (
          <p>No items yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(it => (
                <tr key={it.id}>
                  <td>{it.product.name}</td>
                  <td>{currency(it.product.price)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => updateQty(it.id, Math.max(1, parseInt(e.target.value || '1', 10)))}
                      style={{ width: 60 }}
                    />
                  </td>
                  <td>{currency(it.product.price * it.quantity)}</td>
                  <td><button onClick={() => removeItem(it.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right' }}><strong>Total</strong></td>
                <td colSpan="2"><strong>{currency(total)}</strong></td>
              </tr>
            </tfoot>
          </table>
        )}

        <div className="row">
          <button onClick={clearCart} disabled={cart.length === 0}>Clear Cart</button>
        </div>
      </section>
    </div>
  );
}

export default App;

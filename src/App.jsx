import React, { useMemo, useState } from 'react';
import { ShoppingCart, ScanLine, Trash2, Plus, Minus, Printer, Search, Package2, ReceiptText, Store, Box, Barcode, Users, FileText, Building2, Percent, FileDown, Truck } from 'lucide-react';

// عناصر واجهة بسيطة
const Btn = ({ children, className = '', onClick, type = 'button', disabled }) => (
  <button type={type} disabled={disabled} onClick={onClick} className={`px-3 py-2 rounded-2xl shadow-sm border text-sm hover:shadow transition ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>{children}</button>
);
const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl shadow-sm border p-4 bg-white ${className}`}>{children}</div>
);
const Input = ({ className = '', ...props }) => (
  <input className={`w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${className}`} {...props} />
);
const Select = ({ className = '', children, ...props }) => (
  <select className={`w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${className}`} {...props}>{children}</select>
);
const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${className}`}>{children}</span>
);

const currency = (n) => new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD', maximumFractionDigits: 0 }).format(n || 0);

const seedProducts = [
  { id: 1, sku: 'MIO-DEX-50', name: 'Mio Skin Deodorant 50ml', brand: 'Mio Skin', price: 6500, stock: 24, barcode: '8691190533717', image: 'https://placehold.co/100x100' },
  { id: 2, sku: 'CEL-RET-30', name: "Celene's Retinol 1% Serum", brand: 'Celenes', price: 14500, stock: 15, barcode: '8681546110099', image: 'https://placehold.co/100x100' },
  { id: 3, sku: 'GR-FOU-01', name: 'Golden Rose Moisture Touch 01', brand: 'Golden Rose', price: 12000, stock: 18, barcode: '8691190533000', image: 'https://placehold.co/100x100' },
  { id: 4, sku: 'GR-FOU-02', name: 'Golden Rose Moisture Touch 02', brand: 'Golden Rose', price: 12000, stock: 12, barcode: '8691190533001', image: 'https://placehold.co/100x100' },
  { id: 5, sku: 'ELI-CRM-75', name: 'Elina med Cream 75ml', brand: 'Elina', price: 8000, stock: 40, barcode: '8691190533002', image: 'https://placehold.co/100x100' },
];

const seedCustomers = [
  { id: 1, name: 'عميل نقدي', phone: '', email: '' },
  { id: 2, name: 'سارة محمد', phone: '0770 000 1111', email: '' },
  { id: 3, name: 'متجر نور', phone: '0780 123 4567', email: 'noor@example.com' },
];

const seedBranches = [
  { id: 1, name: 'فرع المنصور', code: 'MSR', warehouse: 'مخزن المنصور' },
  { id: 2, name: 'فرع الكرادة', code: 'KRD', warehouse: 'مخزن الكرادة' },
];

const seedSuppliers = [
  { id: 1, name: 'مؤسسة الرافدين التجارية', phone: '0770 222 3344' },
  { id: 2, name: 'شركة الهدى للتوريد', phone: '0780 555 7788' }
];

// ألوان وهوية نارام
const brand = {
  bg: '#0a0a0a', // أسود داكن
  gold: '#c6a466',
  text: '#111'
};

export default function App() {
  // التبويبات: pos | inv | purchases | crm | invoices | settings
  const [tab, setTab] = useState('pos');

  // الكتالوج / السلة
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState(seedProducts);
  const [cart, setCart] = useState([]); // {sku,name,price,qty}
  const [scan, setScan] = useState('');
  const [note, setNote] = useState('');
  const [discount, setDiscount] = useState(0);
  const [returnMode, setReturnMode] = useState(false); // مرتجعات

  // المدفوعات
  const [payCash, setPayCash] = useState(0);
  const [payCard, setPayCard] = useState(0);

  // الإيصال
  const [receipt, setReceipt] = useState(null);
  const [receiptWidth, setReceiptWidth] = useState('80'); // 80 أو 58

  // تعليق/استرجاع سلات
  const [holds, setHolds] = useState([]); // {id, cart, note, at}

  // العملاء
  const [customers, setCustomers] = useState(seedCustomers);
  const [customerId, setCustomerId] = useState(1);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });

  // فواتير البيع
  const [invoices, setInvoices] = useState([]); // {no, at, branchId, customerName, total, tax, lines}
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // الضريبة
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(0); // %

  // الفروع
  const [branches] = useState(seedBranches);
  const [branchId, setBranchId] = useState(1);

  // إضافة منتج
  const [showAdd, setShowAdd] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', sku: '', brand: '', price: 0, stock: 0, barcode: '', image: '' });

  // المشتريات
  const [suppliers] = useState(seedSuppliers);
  const [supplierId, setSupplierId] = useState(1);
  const [poLines, setPoLines] = useState([]); // {sku, qty, cost}
  const [purchases, setPurchases] = useState([]); // {no, at, supplierName, total, lines}
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const branch = branches.find(b => b.id === branchId);
  const customer = customers.find(c => c.id === customerId);
  const supplier = suppliers.find(s => s.id === supplierId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => [p.name, p.sku, p.brand, p.barcode].join(' ').toLowerCase().includes(q));
  }, [query, products]);

  const addToCart = (p) => {
    setCart(prev => {
      const i = prev.findIndex(x => x.sku === p.sku);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
        return copy;
      }
      return [...prev, { sku: p.sku, name: p.name, price: p.price, qty: 1 }];
    });
  };
  const removeFromCart = (sku) => setCart(prev => prev.filter(x => x.sku !== sku));
  const setQty = (sku, delta) => setCart(prev => prev.map(x => x.sku === sku ? { ...x, qty: Math.max(1, x.qty + delta) } : x));

  const scanBarcode = () => {
    const q = scan.trim();
    if (!q) return;
    const p = products.find(p => p.barcode === q || p.sku.toLowerCase() === q.toLowerCase());
    if (p) addToCart(p);
    setScan('');
  };

  const totals = useMemo(() => {
    const sub = cart.reduce((s, l) => s + l.price * l.qty, 0);
    const disc = Math.min(discount || 0, sub);
    const base = Math.max(0, sub - disc);
    const tax = taxEnabled ? Math.round(base * (Number(taxRate || 0) / 100)) : 0;
    const sign = returnMode ? -1 : 1;
    const grand = sign * (base + tax);
    return { sub, disc, tax, grand, sign };
  }, [cart, discount, returnMode, taxEnabled, taxRate]);

  const holdCart = () => {
    if (!cart.length) return;
    const id = 'H' + Date.now();
    setHolds(prev => [...prev, { id, cart, note, at: new Date().toLocaleString('ar-IQ'), customerName: customer?.name }]);
    setCart([]); setNote(''); setDiscount(0); setPayCash(0); setPayCard(0); setReturnMode(false);
  };
  const resumeHold = (id) => {
    const h = holds.find(x => x.id === id);
    if (!h) return;
    setCart(h.cart); setNote(h.note || ''); setDiscount(0); setPayCash(0); setPayCard(0); setReturnMode(false);
    setHolds(prev => prev.filter(x => x.id !== id));
  };

  const completeSale = () => {
    if (!cart.length) return;
    const paid = Number(payCash || 0) + Number(payCard || 0);
    if (Math.round(paid) !== Math.round(Math.abs(totals.grand))) {
      alert('المبلغ المدفوع لا يساوي الإجمالي.');
      return;
    }
    const invoiceNo = 'INV-' + Date.now();
    const at = new Date().toLocaleString('ar-IQ');

    setReceipt({ invoiceNo, at, lines: cart, totals, note, width: receiptWidth, paid: { cash: payCash, card: payCard }, branch: branch?.name, customer: customer?.name });

    // المخزون: البيع يُنقص والمرتجع يزيد
    setProducts(prev => prev.map(p => {
      const line = cart.find(l => l.sku === p.sku);
      if (!line) return p;
      const delta = returnMode ? line.qty : -line.qty;
      return { ...p, stock: Math.max(0, p.stock + delta) };
    }));

    // حفظ الفاتورة
    setInvoices(prev => [{
      no: invoiceNo,
      at,
      branchId,
      customerName: customer?.name || 'عميل نقدي',
      total: Math.abs(totals.grand),
      tax: Math.abs(totals.tax),
      lines: cart
    }, ...prev]);

    // إعادة التهيئة
    setCart([]); setDiscount(0); setNote(''); setPayCash(0); setPayCard(0); setReturnMode(false);
  };

  const inventoryAdjust = (sku, delta) => {
    setProducts(prev => prev.map(p => p.sku === sku ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  };

  const addCustomer = () => {
    if (!newCustomer.name) return;
    const id = Date.now();
    setCustomers(prev => [...prev, { id, ...newCustomer }]);
    setNewCustomer({ name: '', phone: '', email: '' });
    setShowAddCustomer(false);
    setCustomerId(id);
  };

  const addNewProduct = () => {
    if (!newProd.name || !newProd.sku) return;
    setProducts(prev => [...prev, {
      id: Date.now(),
      name: newProd.name,
      sku: newProd.sku,
      brand: newProd.brand,
      price: Number(newProd.price) || 0,
      stock: Number(newProd.stock) || 0,
      barcode: newProd.barcode,
      image: newProd.image || 'https://placehold.co/100x100'
    }]);
    setShowAdd(false);
    setNewProd({ name: '', sku: '', brand: '', price: 0, stock: 0, barcode: '', image: '' });
  };

  // فواتير الشراء
  const addPoLine = () => setPoLines(prev => [...prev, { sku: '', qty: 1, cost: 0 }]);
  const updatePoLine = (idx, key, val) => setPoLines(prev => prev.map((l,i)=> i===idx ? { ...l, [key]: val } : l));
  const removePoLine = (idx) => setPoLines(prev => prev.filter((_,i)=> i!==idx));
  const savePurchase = () => {
    if (!poLines.length) return;
    // التأكد من وجود الـSKU
    for (const l of poLines) {
      if (!l.sku) { alert('أدخل SKU لكل بند.'); return; }
      if (!products.find(p=>p.sku===l.sku)) { alert('SKU غير موجود في الكتالوج: '+l.sku); return; }
    }
    // تحديث المخزون
    setProducts(prev => prev.map(p => {
      const line = poLines.find(l=>l.sku===p.sku);
      if (!line) return p;
      return { ...p, stock: p.stock + Number(line.qty || 0) };
    }));
    const total = poLines.reduce((s,l)=> s + (Number(l.qty||0)*Number(l.cost||0)), 0);
    const po = { no: 'PO-'+Date.now(), at: new Date().toLocaleString('ar-IQ'), supplierName: supplier?.name, total, lines: poLines };
    setPurchases(prev => [po, ...prev]);
    setSelectedPurchase(po);
    setPoLines([]);
  };

  // طباعة/تصدير (تجريبي)
  const printSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const w = window.open('', 'PRINT', 'height=650,width=900');
    if (!w) return;
    w.document.write('<html dir="rtl"><head><title>Print</title>');
    w.document.write('<style>body{font-family: system-ui,Segoe UI,Tahoma;}</style>');
    w.document.write('</head><body>'+ el.innerHTML +'</body></html>');
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-[system-ui]" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-wrap items-center gap-3 mb-6">
          <Store className="w-8 h-8" />
          <h1 className="text-2xl md:text-3xl font-bold">Naram — POS & Inventory (Demo)</h1>
          <div className="ml-auto flex gap-2 flex-wrap">
            <Btn className={`${tab === 'pos' ? 'bg-black text-white' : 'bg-white'}`} onClick={() => setTab('pos')}><ShoppingCart className="w-4 h-4 mr-1 inline" /> POS</Btn>
            <Btn className={`${tab === 'inv' ? 'bg-black text-white' : 'bg-white'}`} onClick={() => setTab('inv')}><Package2 className="w-4 h-4 mr-1 inline" /> المخزون</Btn>
            <Btn className={`${tab === 'purchases' ? 'bg-black text-white' : 'bg-white'}`} onClick={() => setTab('purchases')}><Truck className="w-4 h-4 mr-1 inline" /> مشتريات</Btn>
            <Btn className={`${tab === 'crm' ? 'bg-black text-white' : 'bg-white'}`} onClick={() => setTab('crm')}><Users className="w-4 h-4 mr-1 inline" /> العملاء</Btn>
            <Btn className={`${tab === 'invoices' ? 'bg-black text-white' : 'bg-white'}`} onClick={() => setTab('invoices')}><FileText className="w-4 h-4 mr-1 inline" /> الفواتير</Btn>
            <Btn className={`${tab === 'settings' ? 'bg-black text-white' : 'bg-white'}`} onClick={() => setTab('settings')}><Building2 className="w-4 h-4 mr-1 inline" /> الإعدادات</Btn>
          </div>
        </header>

        {tab === 'pos' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* المنتجات */}
            <Card className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                  <Input placeholder="بحث بالاسم / الباركود / SKU" value={query} onChange={e => setQuery(e.target.value)} className="pl-9" />
                </div>
                <Badge className="bg-white">{filtered.length} منتج</Badge>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map(p => (
                  <div key={p.sku} className="rounded-2xl border bg-white p-3 hover:shadow-sm transition flex flex-col">
                    <img src={p.image} alt={p.name} className="rounded-xl w-full h-28 object-cover mb-2" />
                    <div className="text-sm text-gray-500">{p.brand}</div>
                    <div className="font-semibold leading-tight">{p.name}</div>
                    <div className="text-xs text-gray-500">SKU: {p.sku}</div>
                    <div className="mt-1 text-sm"><Badge className="bg-white">المتوفر: {p.stock}</Badge></div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="font-bold">{currency(p.price)}</div>
                      <Btn className="bg-black text-white" onClick={() => addToCart(p)}><Plus className="w-4 h-4" /></Btn>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* السلة والمدفوعات */}
            <Card>
              {/* الفرع + العميل */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <div className="text-xs text-gray-600 mb-1">الفرع</div>
                  <Select value={branchId} onChange={e => setBranchId(Number(e.target.value))}>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </Select>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">العميل</div>
                  <Select value={customerId} onChange={e => setCustomerId(Number(e.target.value))}>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <ScanLine className="w-4 h-4" />
                <div className="font-semibold">المسح بالباركود / SKU</div>
              </div>
              <div className="flex gap-2 mb-4">
                <Input placeholder="أدخل الباركود أو SKU ثم اضغط إدخال" value={scan} onChange={e => setScan(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && scanBarcode()} />
                <Btn onClick={scanBarcode} className="bg-white"><Barcode className="w-4 h-4" /></Btn>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <ReceiptText className="w-4 h-4" />
                <div className="font-semibold">السلة</div>
                <Badge className="bg-white">{cart.length} عنصر</Badge>
              </div>

              <div className="space-y-2 max-h-56 overflow-auto pr-1">
                {cart.map(l => (
                  <div key={l.sku} className="flex items-center gap-2 border rounded-xl p-2">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{l.name}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Btn className="bg-white" onClick={() => setQty(l.sku, -1)}><Minus className="w-4 h-4" /></Btn>
                      <div className="w-8 text-center font-semibold">{l.qty}</div>
                      <Btn className="bg-white" onClick={() => setQty(l.sku, 1)}><Plus className="w-4 h-4" /></Btn>
                    </div>
                    <div className="w-24 text-right font-bold">{currency(l.price * l.qty)}</div>
                    <Btn className="bg-white" onClick={() => removeFromCart(l.sku)}><Trash2 className="w-4 h-4" /></Btn>
                  </div>
                ))}
                {!cart.length && (
                  <div className="text-sm text-gray-500">لا توجد عناصر — أضف منتجات من القائمة أو بالباركود.</div>
                )}
              </div>

              {/* الضرائب والمجاميع */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 col-span-2">
                  <input id="returnMode" type="checkbox" checked={returnMode} onChange={e => setReturnMode(e.target.checked)} />
                  <label htmlFor="returnMode">وضع المرتجعات</label>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <input id="taxEnabled" type="checkbox" checked={taxEnabled} onChange={e => setTaxEnabled(e.target.checked)} />
                  <label htmlFor="taxEnabled" className="flex items-center gap-1"><Percent className="w-3 h-3"/> تفعيل الضريبة</label>
                  {taxEnabled && (
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-gray-600">النسبة %</span>
                      <Input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value) || 0)} className="w-24 text-right" />
                    </div>
                  )}
                </div>
                <div className="flex justify-between"><span>الاجمالي الفرعي</span><span className="font-semibold">{currency(cart.reduce((s,l)=>s+l.price*l.qty,0))}</span></div>
                <div className="flex justify-between items-center gap-2"><span>الخصم</span>
                  <Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)} className="w-28 text-right" />
                </div>
                {taxEnabled && <div className="flex justify-between"><span>الضريبة</span><span className="font-semibold">{currency(Math.abs(totals.tax))}</span></div>}
                <div className="flex justify-between col-span-2 text-lg border-t pt-2"><span className="font-bold">الإجمالي</span><span className="font-extrabold">{currency(Math.abs(totals.grand))}</span></div>
              </div>

              {/* المدفوعات */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2"><span>نقد</span><Input type="number" value={payCash} onChange={e => setPayCash(Number(e.target.value) || 0)} className="w-28 text-right" /></div>
                <div className="flex items-center gap-2"><span>بطاقة</span><Input type="number" value={payCard} onChange={e => setPayCard(Number(e.target.value) || 0)} className="w-28 text-right" /></div>
                <div className="flex items-center gap-2 col-span-2"><span>حجم الإيصال</span>
                  <select className="border rounded-xl px-2 py-1" value={receiptWidth} onChange={e => setReceiptWidth(e.target.value)}>
                    <option value="80">80mm</option>
                    <option value="58">58mm</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-1">ملاحظة على الفاتورة (اختياري)</div>
                <Input value={note} onChange={e => setNote(e.target.value)} placeholder="مثال: خصم حملة الانستغرام" />
              </div>

              <div className="mt-3 flex gap-2">
                <Btn className="bg-white" onClick={holdCart}>تعليق السلة</Btn>
                <div className="relative">
                  <select className="border rounded-xl px-2 py-2" onChange={(e)=> e.target.value && resumeHold(e.target.value)} defaultValue="">
                    <option value="" disabled>استرجاع سلة</option>
                    {holds.map(h => <option key={h.id} value={h.id}>{h.id} • {h.at}</option>)}
                  </select>
                </div>
                <Btn className="bg-black text-white w-full" onClick={completeSale} disabled={!cart.length}><Printer className="w-4 h-4 mr-1 inline" /> إتمام وطباعة</Btn>
              </div>

              {receipt && (
                <div className="mt-4 border rounded-2xl p-3 bg-gray-50">
                  <div className="font-bold mb-1">إيصال (معاينة) — {receipt.width}mm</div>
                  <div className="text-xs text-gray-600">فرع: {receipt.branch} • عميل: {receipt.customer}</div>
                  <div className="text-xs text-gray-600">فاتورة: {receipt.invoiceNo} • {receipt.at}</div>
                  <hr className="my-2" />
                  <div className="space-y-1 text-sm">
                    {receipt.lines.map(l => (
                      <div key={l.sku} className="flex justify-between">
                        <span>{l.name} × {l.qty}</span>
                        <span>{currency(l.price * l.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <hr className="my-2" />
                  {taxEnabled && <div className="flex justify-between text-sm"><span>الضريبة</span><span className="font-semibold">{currency(Math.abs(receipt.totals.tax))}</span></div>}
                  <div className="flex justify-between text-sm"><span>الإجمالي</span><span className="font-semibold">{currency(Math.abs(receipt.totals.grand))}</span></div>
                  <div className="text-xs text-gray-600">مدفوع: نقد {currency(receipt.paid.cash)} + بطاقة {currency(receipt.paid.card)}</div>
                  {receipt.note && <div className="mt-1 text-xs text-gray-600">ملاحظة: {receipt.note}</div>}
                  <div className="mt-2 text-center text-xs">[QR] — سيتم توليده في النسخة الفعلية</div>
                </div>
              )}
            </Card>
          </div>
        ) : tab === 'inv' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4" />
                <div className="font-semibold">بحث في المخزون</div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge className="bg-white">{products.length} منتج</Badge>
                  <Btn className="bg-black text-white" onClick={() => setShowAdd(v => !v)}><Plus className="w-4 h-4 mr-1 inline" /> إضافة منتج</Btn>
                </div>
              </div>
              <Input placeholder="بحث بالاسم / الباركود / SKU" value={query} onChange={e => setQuery(e.target.value)} />

              {showAdd && (
                <div className="mt-4 border rounded-2xl p-3 bg-white">
                  <div className="font-semibold mb-2">إضافة منتج جديد</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input placeholder="الاسم" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} />
                    <Input placeholder="SKU" value={newProd.sku} onChange={e => setNewProd({ ...newProd, sku: e.target.value })} />
                    <Input placeholder="العلامة التجارية" value={newProd.brand} onChange={e => setNewProd({ ...newProd, brand: e.target.value })} />
                    <Input type="number" placeholder="السعر" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} />
                    <Input type="number" placeholder="الكمية" value={newProd.stock} onChange={e => setNewProd({ ...newProd, stock: e.target.value })} />
                    <Input placeholder="الباركود" value={newProd.barcode} onChange={e => setNewProd({ ...newProd, barcode: e.target.value })} />
                    <Input placeholder="رابط الصورة (اختياري)" value={newProd.image} onChange={e => setNewProd({ ...newProd, image: e.target.value })} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Btn className="bg-black text-white" onClick={addNewProduct}>حفظ</Btn>
                    <Btn className="bg-white" onClick={() => setShowAdd(false)}>إلغاء</Btn>
                  </div>
                </div>
              )}

              <div className="mt-4 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b bg-gray-50">
                      <th className="p-2">المنتج</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2">الباركود</th>
                      <th className="p-2">السعر</th>
                      <th className="p-2">المتوفر</th>
                      <th className="p-2">اجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.sku} className="border-b">
                        <td className="p-2">
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.brand}</div>
                        </td>
                        <td className="p-2">{p.sku}</td>
                        <td className="p-2">{p.barcode}</td>
                        <td className="p-2 font-semibold">{currency(p.price)}</td>
                        <td className="p-2"><Badge className="bg-white">{p.stock}</Badge></td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Btn className="bg-white" onClick={() => inventoryAdjust(p.sku, +1)} title="زيادة"><Plus className="w-4 h-4" /></Btn>
                            <Btn className="bg-white" onClick={() => inventoryAdjust(p.sku, -1)} title="نقصان"><Minus className="w-4 h-4" /></Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Box className="w-4 h-4" />
                <div className="font-semibold">جلسة جرد (تجريبي)</div>
              </div>
              <div className="text-sm text-gray-600 mb-2">ادخل باركود المنتج ثم اضغط اضافة</div>
              <div className="flex gap-2 mb-2">
                <Input value={scan} onChange={e => setScan(e.target.value)} placeholder="Barcode / SKU" onKeyDown={(e) => e.key === 'Enter' && scanBarcode()} />
                <Btn className="bg-white" onClick={scanBarcode}><ScanLine className="w-4 h-4" /></Btn>
              </div>
              <div className="text-xs text-gray-500">يتم تعديل المخزون مباشرة في الجدول عند المسح في هذا العرض التجريبي.</div>
              <div className="mt-3">
                <Btn className="bg-black text-white w-full" onClick={() => alert('سيتم في النسخة الفعلية إنشاء جلسة جرد وتخزين البنود للموافقة ثم الترحيل.')}>ترحيل فروقات الجرد</Btn>
              </div>
            </Card>
          </div>
        ) : tab === 'purchases' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* نموذج فاتورة شراء */}
            <Card className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4" />
                <div className="font-semibold">فاتورة شراء جديدة</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                <div>
                  <div className="text-xs text-gray-600 mb-1">المورد</div>
                  <Select value={supplierId} onChange={e=>setSupplierId(Number(e.target.value))}>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">الفرع</div>
                  <Select value={branchId} onChange={e=>setBranchId(Number(e.target.value))}>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </Select>
                </div>
                <div className="flex items-end">
                  <Btn className="bg-black text-white w-full" onClick={addPoLine}><Plus className="w-4 h-4 mr-1 inline"/> إضافة بند</Btn>
                </div>
              </div>

              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b bg-gray-50">
                      <th className="p-2">SKU</th>
                      <th className="p-2">الكمية</th>
                      <th className="p-2">التكلفة للوحدة</th>
                      <th className="p-2">الإجمالي</th>
                      <th className="p-2">حذف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poLines.map((l,idx)=>(
                      <tr key={idx} className="border-b">
                        <td className="p-2"><Input value={l.sku} onChange={e=>updatePoLine(idx,'sku', e.target.value)} placeholder="SKU"/></td>
                        <td className="p-2"><Input type="number" value={l.qty} onChange={e=>updatePoLine(idx,'qty', Number(e.target.value)||0)} /></td>
                        <td className="p-2"><Input type="number" value={l.cost} onChange={e=>updatePoLine(idx,'cost', Number(e.target.value)||0)} /></td>
                        <td className="p-2 font-semibold">{currency((Number(l.qty||0))*(Number(l.cost||0)))}</td>
                        <td className="p-2"><Btn className="bg-white" onClick={()=>removePoLine(idx)}><Trash2 className="w-4 h-4"/></Btn></td>
                      </tr>
                    ))}
                    {!poLines.length && <tr><td className="p-2 text-gray-500" colSpan={5}>أضف بنود الشراء لبدء إنشاء الفاتورة.</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span>الإجمالي</span>
                <span className="font-bold">{currency(poLines.reduce((s,l)=> s + (Number(l.qty||0)*Number(l.cost||0)), 0))}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Btn className="bg-black text-white" onClick={savePurchase} disabled={!poLines.length}><FileText className="w-4 h-4 mr-1 inline"/> حفظ الفاتورة</Btn>
              </div>
            </Card>

            {/* قائمة فواتير الشراء */}
            <Card>
              <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4"/><div className="font-semibold">فواتير المشتريات</div></div>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b bg-gray-50">
                      <th className="p-2">رقم</th>
                      <th className="p-2">التاريخ</th>
                      <th className="p-2">المورد</th>
                      <th className="p-2">الإجمالي</th>
                      <th className="p-2">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map(po => (
                      <tr key={po.no} className="border-b">
                        <td className="p-2">{po.no}</td>
                        <td className="p-2">{po.at}</td>
                        <td className="p-2">{po.supplierName}</td>
                        <td className="p-2 font-semibold">{currency(po.total)}</td>
                        <td className="p-2">
                          <Btn className="bg-white" onClick={()=>{setSelectedPurchase(po); setTimeout(()=>printSection('pdf-po'),0);}}><FileDown className="w-4 h-4"/></Btn>
                        </td>
                      </tr>
                    ))}
                    {!purchases.length && <tr><td className="p-2 text-gray-500" colSpan={5}>لا توجد فواتير شراء بعد.</td></tr>}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* قالب PDF لفاتورة شراء (مخفي للطباعة) */}
            <div id="pdf-po" className="hidden">
              {selectedPurchase && (
                <PDFInvoice title="فاتورة شراء" docNo={selectedPurchase.no} at={selectedPurchase.at} partyLabel="المورد" partyValue={selectedPurchase.supplierName} lines={selectedPurchase.lines.map(l=>({ name: products.find(p=>p.sku===l.sku)?.name || l.sku, qty:l.qty, price:l.cost }))} total={selectedPurchase.total} />
              )}
            </div>
          </div>
        ) : tab === 'crm' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4" />
                <div className="font-semibold">العملاء</div>
                <div className="ml-auto">
                  <Btn className="bg-black text-white" onClick={()=>setShowAddCustomer(v=>!v)}>إضافة عميل</Btn>
                </div>
              </div>

              {showAddCustomer && (
                <div className="mb-4 p-3 border rounded-2xl bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input placeholder="الاسم" value={newCustomer.name} onChange={e=>setNewCustomer({...newCustomer, name: e.target.value})}/>
                    <Input placeholder="الهاتف" value={newCustomer.phone} onChange={e=>setNewCustomer({...newCustomer, phone: e.target.value})}/>
                    <Input placeholder="البريد (اختياري)" value={newCustomer.email} onChange={e=>setNewCustomer({...newCustomer, email: e.target.value})}/>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Btn className="bg-black text-white" onClick={addCustomer}>حفظ</Btn>
                    <Btn className="bg-white" onClick={()=>setShowAddCustomer(false)}>إلغاء</Btn>
                  </div>
                </div>
              )}

              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b bg-gray-50">
                      <th className="p-2">الاسم</th>
                      <th className="p-2">الهاتف</th>
                      <th className="p-2">البريد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id} className="border-b">
                        <td className="p-2">{c.name}</td>
                        <td className="p-2">{c.phone}</td>
                        <td className="p-2">{c.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <div className="text-sm text-gray-600">يمكنك اختيار عميل افتراضي لواجهة POS من هنا:</div>
              <Select className="mt-2" value={customerId} onChange={e=>setCustomerId(Number(e.target.value))}>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <div className="mt-2 text-xs text-gray-500">العميل المحدّد سيظهر تلقائيًا في شاشة POS.</div>
            </Card>
          </div>
        ) : tab === 'invoices' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4" />
                <div className="font-semibold">فواتير البيع</div>
                <Badge className="bg-white ml-auto">{invoices.length} فاتورة</Badge>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b bg-gray-50">
                      <th className="p-2">رقم</th>
                      <th className="p-2">التاريخ</th>
                      <th className="p-2">الفرع</th>
                      <th className="p-2">العميل</th>
                      <th className="p-2">الإجمالي</th>
                      <th className="p-2">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.no} className="border-b">
                        <td className="p-2">{inv.no}</td>
                        <td className="p-2">{inv.at}</td>
                        <td className="p-2">{branches.find(b=>b.id===inv.branchId)?.name}</td>
                        <td className="p-2">{inv.customerName}</td>
                        <td className="p-2 font-semibold">{currency(inv.total)}</td>
                        <td className="p-2">
                          <Btn className="bg-white" onClick={()=>{setSelectedInvoice(inv); setTimeout(()=>printSection('pdf-sale'),0);}}><FileDown className="w-4 h-4"/></Btn>
                        </td>
                      </tr>
                    ))}
                    {!invoices.length && (
                      <tr><td className="p-2 text-gray-500" colSpan={6}>لا توجد فواتير بعد — أتمم بيعًا من تبويب POS لظهورها هنا.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <div className="font-semibold mb-2">قالب PDF بهوية نارام</div>
              <div className="text-xs text-gray-600">اضغط زر PDF في أي سطر لمعاينة وطباعة/حفظ PDF بنمط أسود/ذهبي.</div>
            </Card>

            {/* قالب PDF لفاتورة بيع (مخفي للطباعة) */}
            <div id="pdf-sale" className="hidden">
              {selectedInvoice && (
                <PDFInvoice title="فاتورة بيع" docNo={selectedInvoice.no} at={selectedInvoice.at} partyLabel="العميل" partyValue={selectedInvoice.customerName} lines={selectedInvoice.lines} total={selectedInvoice.total} />
              )}
            </div>
          </div>
        ) : (
          // الإعدادات
          <Card>
            <div className="flex items-center gap-2 mb-4"><Building2 className="w-4 h-4"/><div className="font-semibold">الإعدادات</div></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">الفرع الافتراضي</div>
                <Select value={branchId} onChange={e=>setBranchId(Number(e.target.value))}>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </Select>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">الضريبة الافتراضية (%)</div>
                <Input type="number" value={taxRate} onChange={e=>setTaxRate(Number(e.target.value)||0)} />
                <div className="mt-1 text-xs text-gray-500">فعّل أو عطّل الضريبة من شاشة POS عند الحاجة.</div>
              </div>
            </div>
          </Card>
        )}
        <footer className="mt-8 text-center text-xs text-gray-500">
          Demo UI • POS + Inventory + Purchases + Customers + Invoices • يدعم RTL والطباعة • هذه معاينة شكلية بدون خادم حقيقي
        </footer>
      </div>

      {/* أنماط PDF القابلة للطباعة */}
      <style>{`
        .pdf-card{max-width:800px;margin:0 auto;border:1px solid #ddd;font-family:system-ui,Segoe UI,Tahoma;}
        .pdf-header{background:${brand.bg};color:${brand.gold};padding:16px 20px;}
        .pdf-header h2{margin:0;font-size:20px;}
        .pdf-sub{color:#fff;font-size:12px;opacity:.8}
        .pdf-body{padding:16px 20px;color:${brand.text}}
        .pdf-table{width:100%;border-collapse:collapse;font-size:12px}
        .pdf-table th,.pdf-table td{border-bottom:1px dashed #ccc;padding:8px 6px;text-align:left}
        .pdf-summary{display:flex;justify-content:flex-end;margin-top:10px}
        .pdf-summary .box{min-width:220px;border:1px solid #eee;padding:8px}
        .pdf-footer{padding:10px 20px;font-size:11px;color:#666}
        .pdf-brand{color:${brand.gold}}
      `}</style>
      <div id="pdf-root" className="hidden"/>
    </div>
  );
}

function PDFInvoice({ title, docNo, at, partyLabel, partyValue, lines, total }){
  return (
    <div className="pdf-card">
      <div className="pdf-header">
        <h2>نــارام <span className="pdf-brand">NARAM</span></h2>
        <div className="pdf-sub">{title} • رقم: {docNo} • التاريخ: {at}</div>
      </div>
      <div className="pdf-body">
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
          <div><strong>{partyLabel}:</strong> {partyValue || '—'}</div>
          <div><strong>الهاتف:</strong> 0770 000 0000</div>
        </div>
        <table className="pdf-table">
          <thead>
            <tr><th>الصنف</th><th>الكمية</th><th>السعر/التكلفة</th><th>الإجمالي</th></tr>
          </thead>
          <tbody>
            {lines.map((l,idx)=> (
              <tr key={idx}><td>{l.name}</td><td>{l.qty}</td><td>{currency(l.price)}</td><td>{currency(l.price*l.qty)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="pdf-summary"><div className="box"><div style={{display:'flex',justifyContent:'space-between'}}><span>الإجمالي</span><strong>{currency(total)}</strong></div></div></div>
      </div>
      <div className="pdf-footer">العنوان: بغداد • فرع المنصور • <span className="pdf-brand">naram.com</span></div>
    </div>
  );
}

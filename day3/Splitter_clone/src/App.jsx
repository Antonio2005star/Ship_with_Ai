import { useMemo, useState } from 'react'
import './App.css'

const fuelPresets = {
  petrol: 107.4,
  diesel: 96.2,
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  })
}

function App() {
  const [distance, setDistance] = useState(120)
  const [mileage, setMileage] = useState(40)
  const [people, setPeople] = useState(3)
  const [fuelType, setFuelType] = useState('petrol')
  const [fuelPrice, setFuelPrice] = useState(fuelPresets.petrol)
  const [includeOwner, setIncludeOwner] = useState(true)
  const [roundTo, setRoundTo] = useState(1)
  const [copied, setCopied] = useState(false)
  const [hasCalculated, setHasCalculated] = useState(true)

  const computed = useMemo(() => {
    const safeDistance = Math.max(0, Number(distance) || 0)
    const safeMileage = Math.max(0.01, Number(mileage) || 0.01)
    const safePeople = Math.max(1, Math.floor(Number(people) || 1))
    const safeFuelPrice = Math.max(0, Number(fuelPrice) || 0)

    const totalCost = (safeDistance / safeMileage) * safeFuelPrice
    const payablePeople = includeOwner ? safePeople : Math.max(1, safePeople - 1)
    const rawPerPerson = totalCost / payablePeople
    const eachPersonPays = Math.round(rawPerPerson / roundTo) * roundTo

    return {
      safeDistance,
      safeMileage,
      safePeople,
      safeFuelPrice,
      totalCost,
      payablePeople,
      eachPersonPays,
    }
  }, [distance, mileage, people, fuelPrice, includeOwner, roundTo])

  const shareText = `TRIP COST SPLIT\n---------------\nTotal Cost: Rs ${formatCurrency(computed.totalCost)}\nDistance: ${computed.safeDistance} km\nMileage: ${computed.safeMileage} km/l\nFuel Price: Rs ${formatCurrency(computed.safeFuelPrice)}/l\nPeople: ${computed.safePeople}\n\nSPLIT:\nEach person pays: Rs ${formatCurrency(computed.eachPersonPays)}\n(${computed.payablePeople} people paying${includeOwner ? ' including owner' : ' excluding owner'})`

  const handleFuelSelect = (type) => {
    setFuelType(type)
    setHasCalculated(false)
    if (type === 'custom') return
    setFuelPrice(fuelPresets[type])
  }

  const handleRecalc = () => {
    setHasCalculated(true)
    setCopied(false)
  }

  const resetForm = () => {
    setDistance(120)
    setMileage(40)
    setPeople(3)
    setFuelType('petrol')
    setFuelPrice(fuelPresets.petrol)
    setIncludeOwner(true)
    setRoundTo(1)
    setCopied(false)
    setHasCalculated(true)
  }

  const copySummary = async () => {
    if (!hasCalculated) return
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="layout">
      <section className="intro">
        <p className="kicker">Split Fuel Fairly</p>
        <h1>
          Trip Fuel
          <br />
          Split Calculator
        </h1>
        <p className="rule" />

        <div className="steps">
          <h2>How it works</h2>
          <article>
            <span>01</span>
            <div>
              <h3>Enter trip details</h3>
              <p>Distance, mileage, fuel price and people.</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Set rules</h3>
              <p>Include owner or split among passengers only.</p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Share cost</h3>
              <p>Copy summary and send to your group chat.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="calculator">
        <h2>Trip details</h2>

        <div className="grid">
          <label>
            Distance (km)
            <input
              type="number"
              min="0"
              value={distance}
              onChange={(e) => {
                setDistance(e.target.value)
                setHasCalculated(false)
              }}
            />
          </label>

          <label>
            Mileage (km/l)
            <input
              type="number"
              min="0.01"
              step="0.1"
              value={mileage}
              onChange={(e) => {
                setMileage(e.target.value)
                setHasCalculated(false)
              }}
            />
          </label>

          <div className="fuel-block">
            <p>Fuel price</p>
            <div className="segmented">
              <button
                type="button"
                className={fuelType === 'petrol' ? 'active' : ''}
                onClick={() => handleFuelSelect('petrol')}
              >
                Petrol
              </button>
              <button
                type="button"
                className={fuelType === 'diesel' ? 'active' : ''}
                onClick={() => handleFuelSelect('diesel')}
              >
                Diesel
              </button>
              <button
                type="button"
                className={fuelType === 'custom' ? 'active' : ''}
                onClick={() => handleFuelSelect('custom')}
              >
                Custom
              </button>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={fuelPrice}
              onChange={(e) => {
                setFuelType('custom')
                setFuelPrice(e.target.value)
                setHasCalculated(false)
              }}
            />
          </div>

          <label>
            People in vehicle
            <input
              type="number"
              min="1"
              step="1"
              value={people}
              onChange={(e) => {
                setPeople(e.target.value)
                setHasCalculated(false)
              }}
            />
          </label>
        </div>

        <div className="config-row">
          <label className="toggle">
            <input
              type="checkbox"
              checked={includeOwner}
              onChange={(e) => {
                setIncludeOwner(e.target.checked)
                setHasCalculated(false)
              }}
            />
            Include owner
          </label>

          <label className="round-select">
            <span>Round to</span>
            <select
              value={roundTo}
              onChange={(e) => {
                setRoundTo(Number(e.target.value))
                setHasCalculated(false)
              }}
            >
              <option value={1}>Round to Rs 1</option>
              <option value={5}>Round to Rs 5</option>
              <option value={10}>Round to Rs 10</option>
            </select>
          </label>
        </div>

        <button type="button" className="calc-btn" onClick={handleRecalc}>
          Calculate split
        </button>

        <button type="button" className="copy-btn" onClick={copySummary} disabled={!hasCalculated}>
          {copied ? 'Copied summary' : 'Copy summary'}
        </button>

        <button type="button" className="reset-btn" onClick={resetForm}>
          Reset
        </button>

        {hasCalculated ? (
          <pre className="output">{shareText}</pre>
        ) : (
          <p className="pending">Update complete. Click Calculate Split to refresh summary.</p>
        )}
      </section>
    </main>
  )
}

export default App
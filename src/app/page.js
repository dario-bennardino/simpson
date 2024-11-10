"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Home() {
  const [beerName, setbeerName] = useState("");
  const [beers, setbeers] = useState([]);
  const [allbeers, setAllbeers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isClient, setIsClient] = useState(false); // Stato per verificare se è lato client
  const suggestionsRef = useRef(null); // Riferimento per la lista dei suggerimenti
  const inputRef = useRef(null); // Riferimento per l'input

  // Imposta isClient su true dopo il montaggio del componente (lato client)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carica i dati dal server solo quando siamo sul client
  useEffect(() => {
    if (isClient) {
      const fetchAllbeers = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            "https://api.sampleapis.com/beers/ale"
          );
          console.log(response.data);
          setAllbeers(response.data);
        } catch (error) {
          console.error("Error fetching data", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAllbeers();
    }
  }, [isClient]);

  // Funzione per gestire il cambio del campo di ricerca
  const handleInputChange = (e) => {
    const value = e.target.value;
    setbeerName(value);

    if (value.length > 0) {
      const filteredSuggestions = allbeers.filter((beer) =>
        beer.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Funzione per selezionare un personaggio dalla lista
  const handleSuggestionClick = (name) => {
    setbeerName(name);
    setSuggestions([]);
    searchbeer(name);
  };

  // Funzione per fare la ricerca
  const searchbeer = async (name) => {
    console.log("Ricerca per: ", name);
    if (!name) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get("https://api.sampleapis.com/beers/ale");
      console.log(response.data);

      const filteredbeers = response.data.filter((beer) =>
        beer.name.toLowerCase().includes(name.toLowerCase())
      );

      if (filteredbeers.length > 0) {
        setbeers(filteredbeers);
      } else {
        setbeers([]);
        setErrorMessage("Nessun personaggio trovato con questo nome.");
      }
    } catch (error) {
      setErrorMessage("Si è verificato un errore nella ricerca.");
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per gestire il click al di fuori dell'input e della lista dei suggerimenti
  const handleOutsideClick = (e) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(e.target) &&
      suggestionsRef.current &&
      !suggestionsRef.current.contains(e.target)
    ) {
      setSuggestions([]); // Nasconde la lista dei suggerimenti
    }
  };

  // Aggiungere l'evento al caricamento della pagina
  useEffect(() => {
    if (isClient) {
      document.addEventListener("click", handleOutsideClick);
      return () => {
        document.removeEventListener("click", handleOutsideClick);
      };
    }
  }, [isClient]);

  if (!isClient) {
    return null; // Non renderizzare nulla finché non siamo lato client
  }

  return (
    <div className="container mx-auto mt-10 px-4">
      <h1 className="text-white text-4xl text-center mb-8 font-bold">Beers</h1>

      {/* Input per il nome del personaggio */}
      <div className="relative flex justify-center mb-6">
        <input
          ref={inputRef} // Aggiungi il riferimento all'input
          type="text"
          className="border border-gray-300 rounded-lg p-3 w-1/2"
          placeholder="Cerca un personaggio..."
          value={beerName}
          onChange={handleInputChange}
        />
        <button
          onClick={() => searchbeer(beerName)}
          disabled={loading}
          className="ml-3 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Caricamento..." : "Cerca"}
        </button>

        {/* Lista dei suggerimenti */}
        {suggestions.length > 0 && (
          <div
            ref={suggestionsRef} // Aggiungi il riferimento alla lista dei suggerimenti
            className="absolute z-10 bg-white border border-gray-300 w-full max-h-60 overflow-y-auto mt-1 rounded-lg shadow-lg"
          >
            {suggestions.map((beer) => (
              <div
                key={beer.id}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSuggestionClick(beer.name)}
              >
                {beer.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messaggio di errore */}
      {errorMessage && (
        <div className="text-red-500 text-center mb-4">{errorMessage}</div>
      )}

      {/* Risultati della ricerca */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
        {Array.isArray(beers) && beers.length > 0 ? (
          beers.map((beer) => (
            <div className="max-w-xs mx-auto" key={beer.id}>
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <img src={beer.image} alt={beer.name} />
                </div>
                <div className="p-4">
                  <h5 className="text-xl font-semibold">{beer.name}</h5>
                  <p className="text-gray-600 mt-2">ID: {beer.id}</p>
                  <p className="text-gray-600 mt-2">
                    Nome normalizzato: {beer.normalized_name}
                  </p>
                  <p className="text-gray-600 mt-2">
                    Genere: {beer.gender || "Non specificato"}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            Nessun personaggio da mostrare.
          </p>
        )}
      </div>
    </div>
  );
}

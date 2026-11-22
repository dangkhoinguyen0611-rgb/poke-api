const selectEl = document.querySelector("#pokemon-select");
const imgEl = document.querySelector("#pokemon-img");
const nameEl = document.querySelector("#poke-name");
const typeEl = document.querySelector("#poke-type");
const heightEl = document.querySelector("#poke-height");
const weightEl = document.querySelector("#poke-weight");
const bioEl = document.querySelector("#poke-bio");

// 1. Fetch danh sách Pokémon đưa vào select-option
fetch("https://pokeapi.co/api/v2/pokemon?limit=1000")
  .then((res) => res.json())
  .then((data) => {
    console.log(data.results);

    selectEl.innerHTML = '<option value="">-- chọn pokemon --</option>';

    const fragment = document.createDocumentFragment();

    data.results.forEach((pokemon) => {
      const option = document.createElement("option");
      option.value = pokemon.name;
      option.textContent = pokemon.name;
      fragment.appendChild(option);
    });

    selectEl.appendChild(fragment);

    // Chọn sẵn pikachu lúc đầu cho giống ảnh mẫu
    selectEl.value = "pikachu";
    loadPokemonDetail("pikachu");
  })
  .catch((err) => {
    console.error("Lỗi fetch danh sách:", err);
  });

// 2. Hàm lấy chi tiết Pokémon và đổ lên giao diện Pokédex
function loadPokemonDetail(pokemonName) {
  if (!pokemonName) return;

  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    .then((res) => res.json())
    .then(async (poke) => {
      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

      // Ảnh sprite
      imgEl.src =
        poke.sprites.other?.["showdown"]?.front_default ||
        poke.sprites.front_default ||
        "";
      imgEl.alt = poke.name;

      // Name, Type, Height (dm -> m), Weight (hg -> lbs)
      nameEl.textContent = capitalize(poke.name);
      typeEl.textContent = poke.types.map((t) => capitalize(t.type.name)).join(", ");
      heightEl.textContent = `${(poke.height / 10).toFixed(1)}m`;
      weightEl.textContent = `${Math.round(poke.weight * 0.220462)}lbs`;

      // Lấy mô tả BIO từ ability đầu tiên (fallback sang flavor_text của species)
      let bioText = "No bio available.";
      try {
        const abilityUrl = poke.abilities[0]?.ability?.url;
        if (abilityUrl) {
          const abRes = await fetch(abilityUrl);
          const abData = await abRes.json();
          const enEffect = abData.effect_entries.find((e) => e.language.name === "en");
          if (enEffect) {
            bioText = enEffect.short_effect;
          }
        }
      } catch (e) {
        console.warn("Không lấy được bio:", e);
      }

      bioEl.textContent = bioText;
    })
    .catch((err) => {
      console.error("Lỗi fetch chi tiết:", err);
    });
}

// 3. Khi đổi lựa chọn trong select-option
selectEl.addEventListener("change", (e) => {
  const selectedName = e.target.value;
  if (!selectedName) return;

  console.log("Bạn đã chọn:", selectedName);
  loadPokemonDetail(selectedName);
});

// 4. Hỗ trợ bấm Enter khi đang focus vào select
selectEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && selectEl.value) {
    loadPokemonDetail(selectEl.value);
  }
});
(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function o(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(e){if(e.ep)return;e.ep=!0;const n=o(e);fetch(e.href,n)}})();const g=["🐶","🍕","🚀","🎸","🌈","🦄","🐙","🍩","⚽","🎯","🌟","🐼","🧩","🍉","🚲","🐢","🎈","🦊","🐸","🍓"],m=[{name:"Lynstart",rows:3,columns:4},{name:"Dobbel dose",rows:3,columns:6},{name:"Mesterbrett",rows:4,columns:6},{name:"Emoji-maraton",rows:5,columns:8}];function v(r){const s=[...r];for(let o=s.length-1;o>0;o-=1){const a=Math.floor(Math.random()*(o+1));[s[o],s[a]]=[s[a],s[o]]}return s}function f(r){const s=r/2,o=g.slice(0,s);return v(o.flatMap((a,e)=>[{id:e*2,emoji:a,matched:!1},{id:e*2+1,emoji:a,matched:!1}]))}function b(r,s){return m.find(o=>o.rows===r&&o.columns===s)}const t={rows:3,columns:4,cards:f(12),flippedIds:[],moves:0,isResolving:!1},l=document.querySelector("#app");function h(){return t.cards.length>0&&t.cards.every(r=>r.matched)}function $(){return t.cards.filter(r=>r.matched).length}function u(r=t.rows,s=t.columns){t.rows=r,t.columns=s,t.cards=f(r*s),t.flippedIds=[],t.moves=0,t.isResolving=!1,d()}function w(r,s){u(r,s)}function y(r,s){const o=Number(s);if(!Number.isFinite(o))return;const a=r==="rows"?o:t.rows,e=r==="columns"?o:t.columns;a<2||a>6||e<2||e>8||a*e%2!==0||u(a,e)}function k(r){const s=t.cards.find(i=>i.id===r),o=t.flippedIds.includes(r);if(!s||s.matched||o||t.isResolving||t.flippedIds.length===2||(t.flippedIds=[...t.flippedIds,r],d(),t.flippedIds.length!==2))return;t.moves+=1,t.isResolving=!0;const[a,e]=t.flippedIds,n=t.cards.find(i=>i.id===a),c=t.cards.find(i=>i.id===e),p=n&&c&&n.emoji===c.emoji;window.setTimeout(()=>{p&&(t.cards=t.cards.map(i=>t.flippedIds.includes(i.id)?{...i,matched:!0}:i)),t.flippedIds=[],t.isResolving=!1,d()},p?350:850)}function d(){const r=h(),s=b(t.rows,t.columns),o=t.rows*t.columns,a=$();l.innerHTML=`
    <main class="app-shell">
      <section class="game-panel">
        <div class="game-copy">
          <p class="eyebrow">Emoji Memory</p>
          <h1>Finn alle parene</h1>
          <p class="description">
            Velg en modus eller bygg ditt eget brett. Alt er fortsatt enkelt og raskt å forstå — bare større og vanskeligere når du vil.
          </p>
        </div>

        <div class="controls-panel">
          <div class="preset-group" aria-label="Spillmoduser">
            ${m.map(e=>`
                <button
                  type="button"
                  class="preset-button ${e.rows===t.rows&&e.columns===t.columns?"is-active":""}"
                  data-mode="${e.rows}x${e.columns}"
                >
                  <strong>${e.name}</strong>
                  <span>${e.rows} × ${e.columns} · ${e.rows*e.columns} kort</span>
                </button>
              `).join("")}
          </div>

          <div class="custom-controls">
            <label class="field-control">
              <span>Rader</span>
              <select data-size="rows">
                ${[2,3,4,5,6].map(e=>`<option value="${e}" ${e===t.rows?"selected":""}>${e}</option>`).join("")}
              </select>
            </label>

            <label class="field-control">
              <span>Kolonner</span>
              <select data-size="columns">
                ${[2,3,4,5,6,7,8].map(e=>`<option value="${e}" ${e===t.columns?"selected":""}>${e}</option>`).join("")}
              </select>
            </label>

            <div class="board-chip">
              <span>${s?"Aktiv modus":"Egendefinert brett"}</span>
              <strong>${s?s.name:"Fri lek"} · ${t.rows} × ${t.columns} · ${o} kort</strong>
            </div>
          </div>
        </div>

        <div class="status-bar">
          <div class="status-card">
            <span>Trekk</span>
            <strong>${t.moves}</strong>
          </div>
          <div class="status-card">
            <span>Fremdrift</span>
            <strong>${a}/${o} kort funnet</strong>
          </div>
          <div class="status-card status-card-wide">
            <span>Status</span>
            <strong>${r?"Du vant! 🎉":"På jakt etter par"}</strong>
          </div>
        </div>

        <div class="grid" aria-label="Emoji Memory spillbrett" style="grid-template-columns: repeat(${t.columns}, minmax(0, 1fr));">
          ${t.cards.map(e=>{const n=e.matched||t.flippedIds.includes(e.id);return`
                <button
                  type="button"
                  class="memory-card ${n?"is-flipped":""} ${e.matched?"is-matched":""}"
                  data-card-id="${e.id}"
                  aria-label="${n?`Kort med ${e.emoji}`:"Skjult kort"}"
                  aria-pressed="${n}"
                >
                  <span class="card-face card-front">${e.emoji}</span>
                  <span class="card-face card-back">?</span>
                </button>
              `}).join("")}
        </div>

        <div class="footer-row">
          <button type="button" class="reset-button" data-reset-game="true">Spill igjen</button>
          ${r?`<p class="win-text">Du klarte ${o} kort på ${t.moves} trekk.</p>`:""}
        </div>
      </section>
    </main>
  `,l.querySelectorAll("[data-card-id]").forEach(e=>{e.addEventListener("click",()=>{k(Number(e.getAttribute("data-card-id")))})}),l.querySelectorAll("[data-mode]").forEach(e=>{e.addEventListener("click",()=>{const[n,c]=e.getAttribute("data-mode").split("x").map(Number);w(n,c)})}),l.querySelectorAll("[data-size]").forEach(e=>{e.addEventListener("change",n=>{y(e.getAttribute("data-size"),n.target.value)})}),l.querySelector("[data-reset-game]")?.addEventListener("click",()=>u())}d();

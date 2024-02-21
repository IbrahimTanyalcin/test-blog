<script data-some-attr="look">
  !function(){
    const prefix = document.currentScript.getAttribute("data-some-attr");
    document.querySelector(".text-container-1").textContent = `
      ${prefix} this is a script that is being executed. So be careful not 
      accept 'any' PR. If you are unsure of the document, consider purification.`
  }()
</script>

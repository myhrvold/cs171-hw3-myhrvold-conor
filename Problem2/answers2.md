<p>
<b> 
1.	Look at the data given in the Wiki table. Describe the data types. What is different from the datasets you've used before? 
</b>
</p>

<p>
The actual data type appears to be text, but not just what you can convert to numerical format, as each cell may contain a range of population estimates (an upper and lower bound.) This is different from data sets where each cell contains one value, like for instance the Obama/Romney state voting percentages.
</p>
<p>
Years are also negative to positive, although we are told we can exclude < 0 AD.
</p>
<p>
Also, the headers have references, which probably won’t affect our formatting too much as we’ll want to exclude them from the main part of our data importation, but still might cause some display issues for us.
</p>
<p>
Finally, we are likely dealing with different numbers of sig figs which could be an issue for us, but for the purposes of this problem set I will ignore this issue. (i.e. see http://www.usca.edu/chemistry/genchem/sigfig.htm -- this is problematic since future estimates cannot really claim to have the specificity of even hundreds of thousands of people, let alone an estimate 35+ years in the future to the person given the uncertainties involved.)
</p>

<p>
<b> 
2.	Take a look at the DOM tree for the Wikipedia table. Formulate in jQuery selector syntax the selection that would give you the DOM element for the second row in the Wikipedia table. Write down in selection syntax how you would get all table rows that are not the header row.
</b>
</p>

<p>
The DOM progression to get from the data is: html -> body -> div id=”content” ->  div id=”bodyContent” -> table class=”wikitable” -> tbody
</p>
<p>
The data types are th’s (table header cells) inside of tr’s (table rows), all within a table. The index starts at 0, so the 2nd row is index 1. index 0 is the header row, and does not contain data.
</p>
<p>
Second row of table: $("tr:nth(1)")
</p>
<p>
All table rows except the header (first) row: $("tr:gt(0)")
</p>


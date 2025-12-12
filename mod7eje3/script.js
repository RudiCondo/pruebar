/**
 * Masonry Layout Script
 * 
 * This script calculates the height of each item and sets the grid-row-end property
 * to make the item span the correct number of rows in the CSS Grid.
 */

const grid = document.querySelector('.masonry-wrapper');
const rowHeight = 10; // Must match grid-auto-rows in CSS (10px)
const rowGap = 20;    // Must match gap in CSS (20px)

const resizeGridItem = (item) => {
    const content = item.querySelector('.pin-content');
    const figure = item.querySelector('figure');
    const img = item.querySelector('img');

    if (img && !img.complete) {
        img.onload = () => resizeGridItem(item);
        return;
    }

    // Measure the content's natural height
    // We sum the height of the figure (image) and the text content
    const imgHeight = figure ? figure.getBoundingClientRect().height : 0;
    const contentHeight = content ? content.getBoundingClientRect().height : 0;

    // Total needed height
    const totalHeight = imgHeight + contentHeight;

    // Calculate the span
    // Formula: span = ceil( (height + gap) / (rowHeight + gap) ) * correction factor
    // We add a small buffer (10px) to ensure no cut-off due to rounding
    const rowSpan = Math.ceil((totalHeight + rowGap) / (rowHeight + rowGap));

    item.style.gridRowEnd = `span ${rowSpan + 1}`;
}

const resizeAllGridItems = () => {
    const allItems = document.getElementsByClassName('pin');
    for (let x = 0; x < allItems.length; x++) {
        // We reset to auto to calculate natural height?
        // allItems[x].style.gridRowEnd = "auto"; 
        // No, that causes jumping.
        resizeGridItem(allItems[x]);
    }
}

const resizeInstance = (instance) => {
    item = instance.elements[0];
    resizeGridItem(item);
}

window.onload = resizeAllGridItems;
window.addEventListener('resize', resizeAllGridItems);

// Observe for image loads if not caught by onload
const allItems = document.getElementsByClassName('pin');
for (let x = 0; x < allItems.length; x++) {
    const img = allItems[x].querySelector('img');
    if (img) {
        img.addEventListener('load', () => resizeGridItem(allItems[x]));
    }
}

// Initial calculation
resizeAllGridItems();

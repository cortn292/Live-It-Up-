const arenaChannels = [
    { name: 'Staten Island', url: 'https://api.are.na/v3/channels/live-it-up-staten-island/contents?per=100', key: 'staten-island' },
    { name: 'Bronx', url: 'https://api.are.na/v3/channels/live-it-up-bronx/contents?per=100', key: 'bronx' },
    { name: 'Manhattan', url: 'https://api.are.na/v3/channels/live-it-up-manhattan/contents?per=100', key: 'manhattan' },
    { name: 'Queens', url: 'https://api.are.na/v3/channels/live-it-up-queens/contents?per=100', key: 'queens' },
    { name: 'Brooklyn', url: 'https://api.are.na/v3/channels/live-it-up-brooklyn/contents?per=100', key: 'brooklyn' },
];

const container = document.getElementById('image-container');
const select = document.getElementById('borough-select');

function getImageUrl(block) {
    return (
        block.image?.src ||
        block.image?.original?.url ||
        block.image?.display?.url ||
        block.image?.large?.url ||
        null
    );
}

function createBlockElement(block) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'block';

    const imageUrl = getImageUrl(block);
    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = block.source?.title || block.title || 'Are.na image';
        itemDiv.appendChild(img);
    }

    const title = document.createElement('h2');
    title.innerText = block.source?.title || block.title || 'Untitled';
    itemDiv.appendChild(title);

    if (block.content?.markdown) {
        const textPara = document.createElement('p');
        textPara.className = 'text-content';
        textPara.innerText = block.content.markdown;
        itemDiv.appendChild(textPara);
    }

    if (block.description?.markdown) {
        const descPara = document.createElement('p');
        descPara.className = 'description';
        descPara.innerText = block.description.markdown;
        itemDiv.appendChild(descPara);
    }

    return itemDiv;
}

function createChannelSection(name, items) {
    const section = document.createElement('section');
    section.className = 'channel-section';

    const heading = document.createElement('h1');
    heading.innerText = name;
    section.appendChild(heading);

    if (!items || items.length === 0) {
        const empty = document.createElement('p');
        empty.innerText = 'No items found for this channel.';
        section.appendChild(empty);
        return section;
    }

    const grid = document.createElement('div');
    grid.className = 'channel-grid';

    items.forEach(block => {
        const blockEl = createBlockElement(block);
        grid.appendChild(blockEl);
    });

    section.appendChild(grid);
    return section;
}

async function getImages(channelsToLoad) {
    container.innerHTML = '';

    const responses = await Promise.allSettled(
        channelsToLoad.map(channel =>
            fetch(channel.url)
                .then(resp => {
                    if (!resp.ok) {
                        throw new Error(`${channel.name} fetch failed: ${resp.status}`);
                    }
                    return resp.json();
                })
                .then(data => ({ name: channel.name, items: data.data }))
        )
    );

    responses.forEach((result, index) => {
        const channelName = channelsToLoad[index].name;
        if (result.status === 'fulfilled') {
            const section = createChannelSection(channelName, result.value.items);
            container.appendChild(section);
        } else {
            console.error(`Error loading ${channelName}:`, result.reason);
            const errorSection = document.createElement('section');
            errorSection.className = 'channel-section';
            const heading = document.createElement('h1');
            heading.innerText = channelName;
            errorSection.appendChild(heading);
            const message = document.createElement('p');
            message.innerText = 'Unable to load this channel. Check the API endpoint or network request.';
            errorSection.appendChild(message);
            container.appendChild(errorSection);
        }
    });
}

function handleSelection() {
    const selectedValue = select.value;
    if (selectedValue === 'all') {
        getImages(arenaChannels);
    } else {
        const selectedChannel = arenaChannels.find(channel => channel.key === selectedValue);
        if (selectedChannel) {
            getImages([selectedChannel]);
        }
    }
}

select.addEventListener('change', handleSelection);


getImages(arenaChannels);

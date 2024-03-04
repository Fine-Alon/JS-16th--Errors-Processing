const URL = '/api/products'
// const URL = '/api/products?json_invalid=true'
// const URL = 'api/products?status=500'
// const URL = 'api/products?status=404'
// const URL = '/api/products?status=200'
const app = document.getElementById('app')

const getItems = async (url, retries = 2) => {

  let res = await fetch(url)

  if (res.status === 404) {
    throw new SyntaxError('Resource not found')
  }

  if (res.status === 500 && retries > 0) {
    console.warn('retries request, attempts left:', retries)
    return getItems(url, retries - 1)

  } else if (retries === 0) {
    console.warn('no more attempts left!')
    throw new SyntaxError('Internal Server Error')
  }

  return res.json()
}

const createLoadingSpinner = () => {
  const container = document.createElement('div');
  container.classList.add('d-flex', 'align-items-center', 'justify-content-center', 'spinner');
  container.style.height = '100vh'

  // Create the spinner element
  const spinner = document.createElement('div');
  spinner.classList.add('spinner-border');
  spinner.setAttribute('role', 'status');

  // Create the visually hidden text for accessibility
  const visuallyHiddenText = document.createElement('span');
  visuallyHiddenText.classList.add('visually-hidden');
  visuallyHiddenText.textContent = 'Loading...';

  // Append the spinner and text to the container
  spinner.appendChild(visuallyHiddenText);
  container.appendChild(spinner);

  // Append the container to the body or any desired parent element
  document.body.prepend(container);
}

const createWarningBox = () => {
  const box = document.createElement('div')

  box.classList.add('p-4', 'rounded', 'm-3', 'bg-secondary', 'warnings')
  box.style.alignSelf = 'flex-end'

  return box
}

const createWarning = (message = 'No Warning') => {
  const errorMsg = document.createElement('p')
  errorMsg.classList.add('p-3', 'mb-2', 'rounded-pill', 'text-warning', 'bg-danger', 'fs-2', "fw-bold")

  if (message.message.includes('JSON')) {
    errorMsg.textContent = 'Произошла ошибка, попробуйте обновить страницу позже'
  } else if (message.message.includes('Resource not found')) {
    errorMsg.textContent = 'Список товаров пуст'
  } else if (message.message.includes('Internal Server Error')) {
    errorMsg.textContent = 'Произошла ошибка, попробуйте обновить страницу позже'
  }

  return errorMsg
}

const createProduct = (data) => {
  const product = document.createElement('div')
  const cardBody = document.createElement('div')
  const img = document.createElement('img')
  const name = document.createElement('p')
  const price = document.createElement('div')

  product.classList.add('card', 'p-3', 'm-3', 'bg-secondary')
  product.style.width = '18rem'
  product.style.maxHeight = '450px'

  img.src = data.image
  img.alt = data.name
  img.classList.add('card-img-top', 'mb-3')

  name.textContent = data.name
  product.classList.add('fw-bold', 'text-white')

  price.textContent = 'price: ' + data.price
  product.classList.add('fst-italic', 'text-white')

  cardBody.append(name, price)
  product.append(img, cardBody)

  return product
}

const createProductsList = (data) => {
  const cardsBox = document.createElement('div')
  cardsBox.classList.add('d-flex', 'justify-content-center', 'flex-wrap')

  for (const card of data) {
    cardsBox.append(createProduct(card))
  }

  return cardsBox
}

const createIsOnlineChecker = () => {
  const box = document.createElement('div')
  box.classList.add('p-1', 'position-absolute', 'border', 'rounded', 'border-dark', 'top-0', 'end-0', 'z-3')

  const isOnlineMsg = document.createElement('div')
  isOnlineMsg.classList.add('p-2', 'rounded', 'bg-warning', 'fs-3', 'fw-bold')

  isOnlineMsg.textContent = window.navigator.onLine ? "online" : "offline"

  window.addEventListener("offline", (e) => {
    isOnlineMsg.textContent = "offline"
  });

  window.addEventListener("online", (e) => {
    isOnlineMsg.textContent = "online"
  })

  box.append(isOnlineMsg)
  document.body.prepend(box)
}

const createApp = async (container) => {
  createLoadingSpinner()
  createIsOnlineChecker()
  container.classList.add('d-flex', 'justify-content-end', 'flex-nowrap', 'flex-row')
  container.style.height = '100vh'
  const spinner = document.querySelector('.spinner')


  try {
    const data = await getItems(URL)

    if (data && data.products.length) {
      const products = createProductsList(data.products)
      container.append(products)
    }

  } catch (e) {
    const warnings = createWarningBox()

    // check if we have more then one error
    if (e.length) {
      for (const element of e) {
        const errorMsg = createWarning(element)
      }
    } else {
      const errorMsg = createWarning(e)
      warnings.append(errorMsg)
    }
    container.append(warnings)

    //disappear warning after 3 sec
    setTimeout(() => {
      const warningsBox = document.querySelector('.warnings')
      warningsBox.remove()
    }, 3000)

  } finally {
    spinner.classList.add('d-none')
  }
}

createApp(app)

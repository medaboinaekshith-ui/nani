// Pure helper functions (no database, no Express) so they are easy to test.
// They check user input and build the SQL for GET /books.

const ORDER_BY_COLUMNS = ['id', 'title', 'author', 'price'];
const ORDER_DIRECTIONS = ['ASC', 'DESC'];

// Query-string values can be arrays (?limit=1&limit=2); only accept one value
const single = (value) => (typeof value === 'string' ? value : undefined);

const isWholeNumber = (text) => /^[0-9]+$/.test(text);
const isNumber = (text) => text.trim() !== '' && Number.isFinite(Number(text));

// Returns { error } for bad input, otherwise { where, params, orderBy, order, limit, offset }
const parseListQuery = (query) => {
  const searchQ = query.search_q === undefined ? '' : single(query.search_q);
  if (searchQ === undefined) return { error: 'search_q must be a single text value' };

  // order_by and order cannot be ? placeholders, so only allowlisted words reach the SQL
  const orderBy = query.order_by === undefined ? 'id' : single(query.order_by);
  if (!ORDER_BY_COLUMNS.includes(orderBy)) {
    return { error: `order_by must be one of: ${ORDER_BY_COLUMNS.join(', ')}` };
  }

  const order = query.order === undefined ? 'ASC' : (single(query.order) || '').toUpperCase();
  if (!ORDER_DIRECTIONS.includes(order)) return { error: 'order must be ASC or DESC' };

  const limitText = query.limit === undefined ? '10' : single(query.limit);
  if (!limitText || !isWholeNumber(limitText) || Number(limitText) < 1 || Number(limitText) > 100) {
    return { error: 'limit must be a whole number from 1 to 100' };
  }

  const offsetText = query.offset === undefined ? '0' : single(query.offset);
  if (!offsetText || !isWholeNumber(offsetText)) {
    return { error: 'offset must be a whole number, 0 or more' };
  }

  let min;
  let max;
  if (query.min_price !== undefined) {
    const text = single(query.min_price);
    if (text === undefined || !isNumber(text) || Number(text) < 0) {
      return { error: 'min_price must be a number, 0 or more' };
    }
    min = Number(text);
  }
  if (query.max_price !== undefined) {
    const text = single(query.max_price);
    if (text === undefined || !isNumber(text) || Number(text) < 0) {
      return { error: 'max_price must be a number, 0 or more' };
    }
    max = Number(text);
  }
  if (min !== undefined && max !== undefined && min > max) {
    return { error: 'min_price cannot be greater than max_price' };
  }

  const conditions = [];
  const params = [];

  if (searchQ !== '') {
    // Escape LIKE wildcards typed by the user so "50%" is searched literally
    const escaped = searchQ.replace(/[\\%_]/g, '\\$&');
    conditions.push("title LIKE ? ESCAPE '\\'");
    params.push(`%${escaped}%`);
  }
  if (min !== undefined && max !== undefined) {
    conditions.push('price BETWEEN ? AND ?');
    params.push(min, max);
  } else if (min !== undefined) {
    conditions.push('price >= ?');
    params.push(min);
  } else if (max !== undefined) {
    conditions.push('price <= ?');
    params.push(max);
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
    orderBy,
    order,
    limit: Number(limitText),
    offset: Number(offsetText),
  };
};

// Returns an error message for an invalid book body, otherwise null
const validateBook = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object';
  }
  const { title, author, price, pages } = body;
  if (typeof title !== 'string' || title.trim() === '') {
    return 'title is required and must be a non-empty string';
  }
  if (typeof author !== 'string' || author.trim() === '') {
    return 'author is required and must be a non-empty string';
  }
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return 'price is required and must be a number';
  }
  if (price < 0) return 'price cannot be negative';
  if (pages !== undefined && (!Number.isInteger(pages) || pages <= 0)) {
    return 'pages, if given, must be a positive whole number';
  }
  return null;
};

// A valid id is a positive whole number (kept as text for the ? placeholder)
const isValidId = (value) => /^[1-9][0-9]*$/.test(value);

module.exports = { parseListQuery, validateBook, isValidId };
